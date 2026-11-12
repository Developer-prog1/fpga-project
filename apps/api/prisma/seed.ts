import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient, Role } from "@prisma/client";

config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

function round(value: number, digits = 1) {
  const f = 10 ** digits;
  return Math.round(value * f) / f;
}

function dewPoint(tempC: number, rh: number) {
  const a = 17.27;
  const b = 237.7;
  const gamma = (a * tempC) / (b + tempC) + Math.log(Math.max(rh, 1) / 100);
  return (b * gamma) / (a - gamma);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

async function main() {
  console.log("Seeding sensor station...");

  await prisma.reading.deleteMany();
  await prisma.station.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.create({
    data: {
      email: "admin@hamalsaran.am",
      name: "Աննա Մարտիրոսյան",
      role: Role.ADMIN,
    },
  });

  const station = await prisma.station.create({
    data: {
      name: "Համալսարան · դաշտ",
      location: "Արարատյան դաշտ, 40.18° N",
    },
  });

  const now = new Date();
  now.setMinutes(Math.floor(now.getMinutes() / 15) * 15, 0, 0);

  const days = 60;
  const stepsPerDay = 24 * 4;
  const points = days * stepsPerDay;
  const rainEvents = [
    { center: 8.4, width: 0.5, amount: 0.45 },
    { center: 22.1, width: 0.85, amount: 0.8 },
    { center: 37.3, width: 0.4, amount: 0.5 },
    { center: 49.2, width: 0.55, amount: 0.7 },
    { center: 56.6, width: 0.28, amount: 0.35 },
  ];

  let soil = 46;
  const readings = Array.from({ length: points + 1 }, (_, i) => {
    const recordedAt = new Date(now.getTime() - (points - i) * 15 * 60 * 1000);
    const hour = recordedAt.getHours() + recordedAt.getMinutes() / 60;
    const day = i / stepsPerDay;
    const dayWave = Math.sin(((hour - 8) / 24) * Math.PI * 2);
    const noise = (seed: number) => Math.sin(i * 0.37 + seed) * 0.45;
    const drift = -2 + (day / days) * 3.5;
    const cold = Math.exp(-((day - 18) ** 2) / 14) * -5.5;
    const warm = Math.exp(-((day - 44) ** 2) / 22) * 3.2;

    let rainPulse = 0;
    for (const event of rainEvents) {
      const dist = Math.abs(day - event.center);
      if (dist >= event.width) continue;
      const bell = Math.cos((dist / event.width) * (Math.PI / 2)) ** 2;
      const wetHours = hour >= 15 && hour <= 21 ? 1 : 0.12;
      rainPulse += event.amount * bell * wetHours;
    }
    if (day >= days - 1 && hour > 3 && hour < 6) rainPulse += 0.32;
    const rainfallMm = round(rainPulse, 2);

    const airTemp = round(clamp(18 + drift + cold + warm + dayWave * 7 + noise(1), -3, 38));
    const airHumidity = round(clamp(62 - dayWave * 18 + rainfallMm * 14 + noise(2) * 4, 28, 96));
    const soilTemp = round(16.2 + drift * 0.55 + cold * 0.4 + warm * 0.35 + dayWave * 3.4 + noise(3) * 0.35);
    soil = clamp(soil - 0.011 + rainfallMm * 2.2 + noise(5) * 0.02, 17, 74);
    const windSpeed = round(
      clamp(2.1 + Math.abs(dayWave) * 2.5 + rainfallMm * 1.6 + Math.abs(noise(6)) * 1.2, 0.2, 14),
      1,
    );
    const windDirDeg = Math.round((220 + noise(7) * 36 + day * 5.5) % 360);
    const isDay = hour >= 6 && hour <= 19;
    const sun = isDay ? Math.sin(((hour - 6) / 13) * Math.PI) : 0;
    const cloud = rainfallMm > 0.2 ? 0.38 : 1;
    const lightLux = round(sun * 78000 * cloud + (isDay ? 400 : 8), 0);
    const uvIndex = round(clamp(sun * 7.4 * cloud, 0, 11), 1);
    const pressureHpa = round(1015 + Math.sin(day / 9) * 4 + dayWave * -1.6 - rainfallMm * 3.2 + noise(8) * 0.35, 1);

    return {
      recordedAt,
      windSpeed,
      windDirDeg: windDirDeg < 0 ? windDirDeg + 360 : windDirDeg,
      soilMoisture: round(soil, 1),
      soilTemp,
      airTemp,
      airHumidity,
      rainfallMm,
      pressureHpa,
      lightLux,
      uvIndex,
      dewPoint: round(dewPoint(airTemp, airHumidity)),
      stationId: station.id,
    };
  });

  for (let offset = 0; offset < readings.length; offset += 400) {
    await prisma.reading.createMany({ data: readings.slice(offset, offset + 400) });
  }

  console.log("Seed complete:");
  console.log(`  station:  ${station.name}`);
  console.log(`  readings: ${readings.length} (${days} days)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

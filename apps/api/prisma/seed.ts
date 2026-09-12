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

  const points = 24 * 4; // 15-minute intervals
  const readings = Array.from({ length: points + 1 }, (_, i) => {
    const recordedAt = new Date(now.getTime() - (points - i) * 15 * 60 * 1000);
    const hour = recordedAt.getHours() + recordedAt.getMinutes() / 60;
    const dayWave = Math.sin(((hour - 8) / 24) * Math.PI * 2);
    const noise = (seed: number) => Math.sin(i * 0.35 + seed) * 0.5;

    const airTemp = round(18 + dayWave * 7 + noise(1));
    const airHumidity = round(clamp(62 - dayWave * 18 + noise(2) * 4, 28, 92));
    const soilTemp = round(16 + dayWave * 4 + noise(3) * 0.6);
    const rainPulse = hour > 3 && hour < 6 ? 0.6 + Math.abs(noise(4)) : 0;
    const rainfallMm = round(rainPulse, 2);
    const soilMoisture = round(
      clamp(38 - i * 0.04 + rainPulse * 4 + noise(5), 18, 70),
    );
    const windSpeed = round(clamp(2.4 + Math.abs(dayWave) * 2.8 + noise(6) * 1.4, 0.2, 14), 1);
    const windDirDeg = Math.round((240 + noise(7) * 40 + i * 1.2) % 360);
    const isDay = hour >= 6 && hour <= 19;
    const sun = isDay ? Math.sin(((hour - 6) / 13) * Math.PI) : 0;
    const lightLux = round(sun * 78000 + (isDay ? 400 : 8), 0);
    const uvIndex = round(clamp(sun * 7.4, 0, 11), 1);
    const pressureHpa = round(1014.5 + dayWave * -2.2 + noise(8) * 0.6, 1);

    return {
      recordedAt,
      windSpeed,
      windDirDeg: windDirDeg < 0 ? windDirDeg + 360 : windDirDeg,
      soilMoisture,
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

  await prisma.reading.createMany({ data: readings });

  console.log("Seed complete:");
  console.log(`  station:  ${station.name}`);
  console.log(`  readings: ${readings.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

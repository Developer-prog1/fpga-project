import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient, Role } from "@prisma/client";

config({ path: resolve(process.cwd(), "../../.env") });
config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Hamalsaran (admin-only)...");

  await prisma.course.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();

  const admins = await Promise.all([
    prisma.user.create({
      data: {
        email: "admin@hamalsaran.am",
        name: "Աննա Մարտիրոսյան",
        role: Role.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        email: "ops@hamalsaran.am",
        name: "Արմեն Պետրոսյան",
        role: Role.ADMIN,
      },
    }),
  ]);

  const faculties = await Promise.all([
    prisma.faculty.create({
      data: {
        name: "Ինֆորմատիկայի ֆակուլտետ",
        slug: "informatics",
        description: "Ծրագրավորում, տվյալների գիտություն և համակարգային ճարտարագիտություն։",
      },
    }),
    prisma.faculty.create({
      data: {
        name: "Տնտեսագիտության ֆակուլտետ",
        slug: "economics",
        description: "Մակրոտնտեսություն, ֆինանսներ և բիզնես վերլուծություն։",
      },
    }),
    prisma.faculty.create({
      data: {
        name: "Իրավագիտության ֆակուլտետ",
        slug: "law",
        description: "Քաղաքացիական, քրեական և միջազգային իրավունք։",
      },
    }),
  ]);

  const [informatics, economics, law] = faculties;

  await prisma.course.createMany({
    data: [
      {
        code: "CS101",
        title: "Ծրագրավորման հիմունքներ",
        description: "Python և ալգորիթմների ներածություն։",
        credits: 4,
        facultyId: informatics.id,
      },
      {
        code: "CS220",
        title: "Վեբ ծրագրավորում",
        description: "Next.js, NestJS և REST API-ներ։",
        credits: 5,
        facultyId: informatics.id,
      },
      {
        code: "CS310",
        title: "Տվյալների բազաներ",
        description: "PostgreSQL, Prisma և տվյալների մոդելավորում։",
        credits: 4,
        facultyId: informatics.id,
      },
      {
        code: "EC150",
        title: "Մակրոտնտեսություն",
        description: "Ազգային հաշիվներ, գնաճ և դրամավարկային քաղաքականություն։",
        credits: 3,
        facultyId: economics.id,
      },
      {
        code: "EC210",
        title: "Ֆինանսական վերլուծություն",
        description: "Հաշվետվություններ և ներդրումային որոշումներ։",
        credits: 4,
        facultyId: economics.id,
      },
      {
        code: "LW110",
        title: "Սահմանադրական իրավունք",
        description: "ՀՀ սահմանադրություն և պետական ինստիտուտներ։",
        credits: 3,
        facultyId: law.id,
      },
    ],
  });

  console.log("Seed complete:");
  console.log(`  admins:    ${admins.length}`);
  console.log(`  faculties: ${faculties.length}`);
  console.log(`  courses:   6`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

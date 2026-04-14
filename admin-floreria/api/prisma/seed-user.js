import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.js";

const db = new PrismaClient();

async function main() {
  console.log("Creating admin user...");

  const adminEmail = "sergio@perfumeriasz.com";

  await db.users.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      companyId: "company-1",
      email: adminEmail,
      name: "Sergio",
      password: await hashPassword("admin123"),
      role: "ADMIN",
      isActive: true,
    },
  });

  await db.users.upsert({
    where: { email: "admin@perfumeriasz.com" },
    update: {},
    create: {
      companyId: "company-2",
      email: " admin@perfumeriasz.com",
      name: "Admin",
      password: await hashPassword("admin123"),
      role: "ADMIN",
      isActive: true,
    },
  });

  console.log("Admin users created or already exist.");
}

main()
  .catch((e) => {
    console.error("Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

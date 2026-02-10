import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@silvana.bps.go.id" },
    update: {},
    create: {
      email: "admin@silvana.bps.go.id",
      password: hashSync("admin123", 12),
      name: "Administrator",
      professionType: "GOVERNMENT_OFFICIAL",
      role: "ADMIN",
    },
  });

  // Create operator user
  const operator = await prisma.user.upsert({
    where: { email: "operator@silvana.bps.go.id" },
    update: {},
    create: {
      email: "operator@silvana.bps.go.id",
      password: hashSync("operator123", 12),
      name: "Operator PST",
      professionType: "GOVERNMENT_OFFICIAL",
      role: "OPERATOR",
    },
  });

  // Create visitor (demo) user
  const visitor = await prisma.user.upsert({
    where: { email: "pengunjung@silvana.bps.go.id" },
    update: {},
    create: {
      email: "pengunjung@silvana.bps.go.id",
      password: hashSync("pengunjung123", 12),
      name: "Pengunjung Demo",
      professionType: "STUDENT",
      role: "VISITOR",
    },
  });

  console.log("Seeded users:", {
    admin: admin.email,
    operator: operator.email,
    visitor: visitor.email,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

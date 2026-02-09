import { PrismaClient } from "../src/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@silvana.bps.go.id" },
    update: {},
    create: {
      email: "admin@silvana.bps.go.id",
      password: hashSync("admin123", 10),
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
      password: hashSync("operator123", 10),
      name: "Operator PST",
      professionType: "GOVERNMENT_OFFICIAL",
      role: "OPERATOR",
    },
  });

  console.log("Seeded users:", { admin: admin.email, operator: operator.email });
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

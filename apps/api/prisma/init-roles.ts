import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as pg from "pg";

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({
  connectionString,
  max: parseInt(process.env.DB_POOL_MAX || "10", 10),
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_MS || "30000", 10),
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_TIMEOUT_MS || "5000", 10),
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding initial roles...");
  
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "Admin" },
      update: {},
      create: { name: "Admin" },
    }),
    prisma.role.upsert({
      where: { name: "Manager" },
      update: {},
      create: { name: "Manager" },
    }),
    prisma.role.upsert({
      where: { name: "User" },
      update: {},
      create: { name: "User" },
    }),
  ]);

  console.log("✅ Created roles:", roles.map((r) => r.name).join(", "));
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

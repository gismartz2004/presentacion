const { PrismaClient } = require("@prisma/client");

const globalForPrisma = globalThis;
const isProd = process.env.NODE_ENV === "production";

const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Reduce logs en producción; habilita más detalle en desarrollo
    log: isProd ? ["error"] : ["query", "warn", "error"],
  });

if (!isProd) globalForPrisma.prisma = db;

module.exports = { db };

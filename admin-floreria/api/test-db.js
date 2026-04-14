const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const all = await prisma.product.count();
  const active = await prisma.product.count({ where: { isActive: true, isDeleted: false } });
  const featured = await prisma.product.count({ where: { featured: true } });
  
  console.log('--- RESUMEN DB ---');
  console.log('Total Productos:', all);
  console.log('Activos:', active);
  console.log('Destacados (Featured):', featured);
  
  if (active > 0) {
    const samples = await prisma.product.findMany({ 
      where: { isActive: true, isDeleted: false },
      take: 5,
      select: { name: true }
    });
    console.log('Muestra Activos:', samples.map(s => s.name));
  }
}

main().finally(() => prisma.$disconnect());

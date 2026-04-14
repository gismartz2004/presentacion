const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function survey() {
  console.log('--- DATABASE PRODUCT SURVEY ---');
  try {
    const products = await prisma.product.findMany({
      include: {
        company: { select: { name: true } }
      }
    });
    
    console.log(`Found ${products.length} products total.`);
    
    products.forEach(p => {
      console.log(`[ID: ${p.id}] Name: ${p.name} | Active: ${p.isActive} | Deleted: ${p.isDeleted} | Company: ${p.company?.name} (${p.companyId})`);
    });
    
    const companies = await prisma.company.findMany({ select: { id: true, name: true } });
    console.log('\n--- COMPANIES IN DB ---');
    companies.forEach(c => console.log(`ID: ${c.id} | Name: ${c.name}`));

  } catch (err) {
    console.error('Error during survey:', err);
  } finally {
    await prisma.$disconnect();
  }
}

survey();

require('dotenv').config();
const { db: prisma } = require('./src/lib/prisma');

async function debugProducts() {
  console.log('--- Debugging Products API ---');
  try {
    const productsCount = await prisma.product.count();
    console.log('Database product count:', productsCount);

    if (productsCount === 0) {
      console.warn('⚠️ No products found in database. This might be why the store is empty.');
    }

    const sampleProducts = await prisma.product.findMany({
      take: 1,
      include: { variants: true }
    });
    console.log('Sample product query result:', JSON.stringify(sampleProducts, null, 2));

  } catch (error) {
    console.error('❌ PRISMA ERROR:', error.message);
    if (error.code) console.error('Error Code:', error.code);
    if (error.meta) console.error('Error Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

debugProducts();

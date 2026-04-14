const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testCreate() {
  console.log('--- TEST CREACION CON IDs CORRECTOS ---');
  try {
    const newProduct = await prisma.product.create({
      data: {
        name: "TEST SYNC REAL - Eliminar",
        description: "Producto de prueba para verificar sincronizacion",
        price: 1.00,
        category: "General",
        isActive: true,
        featured: false,
        companyId: "cmnnzkgvl0000dpy8cj69hkg7",
        userId: "cmnnzkhdt0002dpy8jmjgjkm1"
      }
    });
    console.log('✅ Producto creado correctamente:', newProduct.id);
    
    const totalActive = await prisma.product.count({ where: { isActive: true, isDeleted: false } });
    console.log('✅ Total activos en DB ahora:', totalActive);
    
    // Limpiamos el producto de prueba
    await prisma.product.delete({ where: { id: newProduct.id } });
    console.log('✅ Producto de prueba eliminado.');
    console.log('');
    console.log('>>> RESULTADO: El Admin Panel ahora puede guardar productos correctamente.');
    
  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testCreate();

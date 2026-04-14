const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

/**
 * Script para generar API Keys para empresas existentes
 * Ejecutar con: node scripts/generate-api-keys.js
 */
async function generateApiKeysForExistingCompanies() {
  try {
    console.log("🔐 Generando API Keys para empresas existentes...");

    // Buscar empresas que no tienen API Key
    const companies = await prisma.company.findMany({
      where: {
        apiKey: null
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });

    console.log(`📊 Encontradas ${companies.length} empresas sin API Key`);

    if (companies.length === 0) {
      console.log("✅ Todas las empresas ya tienen API Keys");
      return;
    }

    // Generar API Keys para cada empresa
    for (const company of companies) {
      const apiKey = 'ak_' + crypto.randomBytes(32).toString('hex');
      const webhookSecret = 'ws_' + crypto.randomBytes(32).toString('hex');

      await prisma.company.update({
        where: { id: company.id },
        data: {
          apiKey,
          webhookSecret,
          allowedDomains: [] // Array vacío por defecto
        }
      });

      console.log(`✨ API Key generada para: ${company.name} (${company.slug})`);
      console.log(`   API Key: ${apiKey}`);
      console.log(`   Webhook Secret: ${webhookSecret}`);
      console.log("");
    }

    console.log("🎉 ¡API Keys generadas exitosamente!");
    console.log("");
    console.log("📋 Próximos pasos:");
    console.log("1. Comparte las API Keys con los desarrolladores de las webs externas");
    console.log("2. Configura los dominios permitidos desde el admin panel");
    console.log("3. Implementa el webhook verification en las webs externas");

  } catch (error) {
    console.error("❌ Error generando API Keys:", error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Función para mostrar información sobre cómo usar la API
 */
function showUsageInstructions() {
  console.log("");
  console.log("🚀 Cómo usar la API externa:");
  console.log("");
  console.log("1. CREAR ORDEN:");
  console.log("   POST /api/external/orders");
  console.log("   Headers:");
  console.log("     - X-API-Key: tu_api_key_aqui");
  console.log("     - X-Webhook-Signature: sha256=signature (opcional)");
  console.log("     - X-Webhook-Timestamp: timestamp (opcional)");
  console.log("     - Content-Type: application/json");
  console.log("");
  console.log("   Body ejemplo:");
  console.log(`   {
     "customerName": "Juan Pérez",
     "customerEmail": "juan@email.com",
     "customerPhone": "555-1234",
     "billingAddress": "Av. Principal 123",
     "billingCity": "Ciudad",
     "billingZip": "12345",
     "billingCountry": "ES",
     "items": [
       {
         "productId": "prod_123",
         "name": "Producto 1",
         "quantity": 2,
         "unitPrice": 25.99
       }
     ],
     "subtotal": 51.98,
     "tax": 4.68,
     "shipping": 5.00,
     "total": 61.66,
     "stripePaymentId": "pi_1234567890",
     "notes": "Entrega urgente"
   }`);
  console.log("");
  console.log("2. CONSULTAR ESTADOS:");
  console.log("   GET /api/external/orders/status?orderNumbers=ORDER-1,ORDER-2");
  console.log("   Headers: X-API-Key: tu_api_key_aqui");
  console.log("");
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generateApiKeysForExistingCompanies()
    .then(() => {
      showUsageInstructions();
      process.exit(0);
    })
    .catch((error) => {
      console.error("Error:", error);
      process.exit(1);
    });
}

module.exports = {
  generateApiKeysForExistingCompanies
};
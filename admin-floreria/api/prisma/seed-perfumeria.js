import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.js";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. Crear tipos de negocio
  console.log("📊 Creating business types...");

  const perfumeryType = await db.businessType.upsert({
    where: { name: "perfumery" },
    update: {},
    create: {
      name: "perfumery",
      label: "Perfumería",
      description: "Tienda especializada en perfumes y fragancias",
      isActive: true,
    },
  });

  // 2. Crear planes de suscripción
  console.log("💳 Creating subscription plans...");

  const basicPlan = await db.plan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "basic",
      is_available: true,
    },
  });

  const intermediatePlan = await db.plan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      name: "intermediate",
      is_available: true,
    },
  });

  const premiumPlan = await db.plan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      name: "premium",
      is_available: true,
    },
  });

  // 6. Crear empresa de ejemplo
  console.log("🏢 Creating sample company...");

  const sampleCompany = await db.company.upsert({
    where: { slug: "perfumeria-los-aromas" },
    update: {},
    create: {
      name: "Perfumería Los Aromas",
      slug: "perfumeria-los-aromas",
      email: "contacto@losaromas.com",
      phone: "+1-555-0123",
      address: "123 Fragrance Ave, Perfume City",
      businessTypeId: perfumeryType.id,
      isActive: true,
      isSetup: true,
      settings: {
        primaryColor: "#FF6B6B",
        secondaryColor: "#4ECDC4",
        currency: "USD",
        language: "es",
      },
    },
  });

  // 7. Crear suscripción para la empresa
  console.log("📋 Creating company subscription...");

  await db.subscription.upsert({
    where: { companyId: sampleCompany.id },
    update: {},
    create: {
      companyId: sampleCompany.id,
      planId: intermediatePlan.id,
      status: "ACTIVE",
      startDate: new Date(),
      trialEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      currentProducts: 0,
      currentUsers: 1,
      currentStorage: 0,
    },
  });

  // 8. Crear usuario administrador para la empresa
  console.log("Creating admin user...");

  const adminEmail = "admin@perfumeriasz.com";

  await db.users.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      companyId: sampleCompany.id,
      email: adminEmail,
      name: "Admin Los Aromas",
      password: await hashPassword("admin123"),
      role: "ADMIN",
      isActive: true,
    },
  });

  // 9. Crear productos de perfumes
  console.log("🧴 Creating perfume products...");

  // Obtener el usuario admin creado
  const adminUser = await db.users.findUnique({
    where: { email: adminEmail },
  });

  

  const createdProducts = [];

  for (const productData of perfumeProducts) {
    try {
      const product = await db.$transaction(async (tx) => {
        // Crear el producto
        const newProduct = await tx.product.create({
          data: {
            companyId: sampleCompany.id,
            userId: adminUser.id,
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            stock: productData.stock,
            image: productData.image,
            featured: productData.featured,
            hasVariants: false,
          },
        });

        // Aplicar filtros al producto
        const filterRelations = [];

        for (const [categoryName, optionValues] of Object.entries(
          productData.filters,
        )) {
          // Buscar la categoría por nombre
          const category = await tx.filter_categories.findFirst({
            where: { name: categoryName },
          });

          if (category) {
            const values = Array.isArray(optionValues)
              ? optionValues
              : [optionValues];

            for (const value of values) {
              // Buscar la opción por categoría y valor
              const option = await tx.filter_options.findFirst({
                where: {
                  categoryId: category.id,
                  value: value,
                },
              });

              if (option) {
                filterRelations.push({
                  productId: newProduct.id,
                  categoryId: category.id,
                  optionId: option.id,
                });
              }
            }
          }
        }

        // Crear todas las relaciones de filtros
        if (filterRelations.length > 0) {
          await tx.product_filters.createMany({
            data: filterRelations,
          });
        }

        return newProduct;
      });

      createdProducts.push(product);
      console.log(`✅ Created product: ${productData.name}`);
    } catch (error) {
      console.error(`❌ Error creating product ${productData.name}:`, error);
    }
  }

  // 10. Crear secuencia de órdenes
  console.log("🔢 Creating order sequence...");

  const orderSequence = await db.sequence.upsert({
    where: { type: "ORD" }, // Ahora funciona porque type es @unique
    update: {},
    create: {
      type: "ORD",
      current: 0,
    },
  });

  // 12. Actualizar contador de productos en la suscripción
  // console.log("🔄 Updating subscription product count...");

  // await db.subscription.update({
  //   where: { companyId: sampleCompany.id },
  //   data: {
  //     currentProducts: createdProducts.length,
  //     currentUsers: 1,
  //     currentStorage: 0.1, // Estimado
  //   },
  // });

  //   console.log("✅ Database seeded successfully!");
  //   console.log("📊 Created:");
  //   console.log("  - 1 Business type");
  //   console.log("  - 3 Subscription plans");
  //   console.log("  - 8 Filter categories");
  //   console.log("  - Multiple filter options");
  //   console.log("  - 1 Sample company with subscription");
  //   console.log("  - 1 Admin user");
  //   console.log(`  - ${createdProducts.length} Perfume products`);
  //   console.log("  - 5 Sample orders");
  //   console.log(`  - Admin login: ${adminEmail} / admin123`);
  // }

  // main()
  //   .catch((e) => {
  //     console.error("❌ Error seeding:", e);
  //     process.exit(1);
  //   })
  //   .finally(async () => {
  //     await db.$disconnect();
  //   });
  // 9. Crear secuencia de órdenes
  // console.log("🔢 Creating order sequence...");

  // await db.sequence.upsert({
  //   where: { type: "ORD" },
  //   update: {},
  //   create: {
  //     type: "ORD",
  //   },
  // });

  console.log("✅ Database seeded successfully!");
  console.log("📊 Created:");
  console.log("  - 1 Business types");
  console.log("  - 3 Subscription plans");
  console.log("  - 8 Filter categories");
  console.log("  - Multiple filter options");
  console.log("  - 1 Sample company with subscription");
  console.log("  - 1 Admin user");
  console.log(`  - Admin login: ${adminEmail} / admin123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

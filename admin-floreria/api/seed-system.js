require('dotenv').config();
const { db: prisma } = require('./src/lib/prisma');

async function seedSystem() {
  console.log('🏗️  Starting System Seeding...');

  try {
    // 1. Get or Create Company
    let company = await prisma.company.findFirst({ where: { slug: 'difiori' } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'DIFIORI',
          slug: 'difiori',
          email: 'admin@difiori.com.ec',
          isActive: true,
          isSetup: true,
        }
      });
      console.log('✅ Company verified:', company.id);
    }

    // 2. Create Plan
    let plan = await prisma.plan.findFirst({ where: { name: 'Premium' } });
    if (!plan) {
      plan = await prisma.plan.create({
        data: {
          name: 'Premium',
          is_available: true,
        }
      });
      console.log('✅ Plan created:', plan.id);
    }

    // 3. Create Tenant for localhost
    let tenant = await prisma.tenants.findFirst({ where: { domain: 'localhost' } });
    if (!tenant) {
      tenant = await prisma.tenants.create({
        data: {
          name: 'DIFIORI Local',
          domain: 'localhost',
          email: 'admin@difiori.com.ec',
          plan_id: plan.id,
        }
      });
      console.log('✅ Tenant created for localhost:', tenant.id);
    }

    // 4. Create Features
    const featuresList = [
      { name: 'discounts', display_name: 'Descuentos' },
      { name: 'loyalty', display_name: 'Fidelidad' },
      { name: 'cms', display_name: 'Gestión de Contenido' },
      { name: 'orders', display_name: 'Órdenes' },
      { name: 'products', display_name: 'Productos' },
    ];

    console.log('📦 Seeding system features...');
    for (const f of featuresList) {
      let feature = await prisma.features.findFirst({ where: { name: f.name } });
      if (!feature) {
        feature = await prisma.features.create({
          data: f
        });
        console.log(`   + Feature: ${f.name}`);
      }

      // Link to Plan
      const existingPF = await prisma.plan_features.findUnique({
        where: { plan_id_feature_id: { plan_id: plan.id, feature_id: feature.id } }
      });

      if (!existingPF) {
        await prisma.plan_features.create({
          data: {
            plan_id: plan.id,
            feature_id: feature.id,
            is_available: true,
          }
        });
      }
    }

    // 5. Create basic Discount Types (required by discounts UI)
    const discountTypes = [
      { id: 1, type_name: 'Porcentaje', description: 'Descuento basado en %' },
      { id: 2, type_name: 'Precio Fijo', description: 'Descuento de monto fijo' },
    ];

    for (const dt of discountTypes) {
      const existingDT = await prisma.discount_types.findUnique({ where: { id: dt.id } });
      if (!existingDT) {
        await prisma.discount_types.create({ data: dt });
        console.log(`   + Discount Type: ${dt.type_name}`);
      }
    }

    console.log('🏁 System seeding finished successfully!');

  } catch (error) {
    console.error('❌ Error during system seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSystem();

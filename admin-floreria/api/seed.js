require('dotenv').config();
const { db: prisma } = require('./src/lib/prisma');
const { hashPassword } = require('./src/lib/password');

const INITIAL_PRODUCTS = [
  {
    name: "Ramo de Rosas Rojas Premium",
    description: "Elegante ramo de 24 rosas rojas frescas de exportación, envueltas en papel decorativo y lazo de seda. Ideal para expresar amor profundo.",
    category: "Ramos de rosas",
    price: 45.00,
    image: "/assets/product1.png",
    featured: true,
    stock: 15,
  },
  {
    name: "Arreglo Primaveral Mixto",
    description: "Combinación vibrante de lirios, margaritas y claveles en tonos pasteles. Una explosión de frescura para cualquier ocasión.",
    category: "Flores mixtas",
    price: 38.00,
    image: "/assets/product2.png",
    featured: true,
    stock: 12,
  },
  {
    name: "Cesta Sorpresa Gourmet",
    description: "Completo desayuno que incluye café premium, croissants recién horneados, ensalada de frutas frescas, jugo de naranja y un mini bouquet decorativo.",
    category: "Desayunos sorpresa",
    price: 55.00,
    image: "/assets/product3.png",
    featured: true,
    stock: 8,
  },
  {
    name: "Caja de Rosas Bouquet Royal",
    description: "Caja de lujo con 12 rosas seleccionadas y follaje decorativo. Un regalo sofisticado y duradero.",
    category: "Amor y aniversario",
    price: 32.00,
    image: "/assets/product4.png",
    featured: false,
    stock: 20,
  },
  {
    name: "Vino & Flores Selection",
    description: "Caja de regalo que incluye una botella de vino tinto Cabernet Sauvignon y un pequeño arreglo de flores complementario.",
    category: "Regalos con vino",
    price: 65.00,
    image: "/assets/product5.png",
    featured: false,
    stock: 5,
  },
  {
    name: "Bouquet Cumpleaños Alegre",
    description: "Arreglo colorido con globos metalizados y flores mixtas. La mejor forma de desear un feliz día.",
    category: "Cumpleaños",
    price: 40.00,
    image: "/assets/product6.png",
    featured: false,
    stock: 10,
  }
];

async function seed() {
  console.log('🌱 Starting seeding process...');

  try {
    // 1. Create or get Company
    let company = await prisma.company.findFirst({ where: { slug: 'difiori' } });
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'DIFIORI',
          slug: 'difiori',
          email: 'admin@difiori.com.ec',
          isActive: true,
          isSetup: true,
          Tax: 0,
          defaultShippingCost: 0,
        }
      });
      console.log('✅ Company created:', company.id);
    } else {
      console.log('ℹ️ Company already exists:', company.id);
    }

    // 2. Create or get Admin User
    let admin = await prisma.users.findFirst({ where: { email: 'admin@difiori.com.ec' } });
    if (!admin) {
      const hashedPassword = await hashPassword('Difiori2024!');
      admin = await prisma.users.create({
        data: {
          email: 'admin@difiori.com.ec',
          password: hashedPassword,
          name: 'Admin DIFIORI',
          role: 'ADMIN',
          companyId: company.id,
        }
      });
      console.log('✅ Admin user created:', admin.id);
    } else {
      console.log('ℹ️ Admin user already exists:', admin.id);
    }

    // 3. Create Products
    console.log('📦 Seeding products...');
    for (const p of INITIAL_PRODUCTS) {
      const existingProduct = await prisma.product.findFirst({
        where: { name: p.name, companyId: company.id }
      });

      if (!existingProduct) {
        await prisma.product.create({
          data: {
            ...p,
            companyId: company.id,
            userId: admin.id,
            isActive: true,
            isDeleted: false,
          }
        });
        console.log(`   + Product added: ${p.name}`);
      } else {
        console.log(`   ~ Product skipped (exists): ${p.name}`);
      }
    }

    console.log('🏁 Seeding finished successfully!');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

// import { hashPassword } from "@/lib/password";
// import { db } from "../src/lib/prisma";
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { hashPassword } from '../src/lib/password.js';

const db = new PrismaClient();

// Interfaz para los datos del menu.json
// interface MenuVariant {
//   name: string;
//   price: number;
// }

// interface MenuItem {
//   name: string;
//   variants: MenuVariant[];
//   images: string[];
// }

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || "stevencajape2003@gmail.com";

  const admin = await db.admin.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Steven Cajape",
      password: await hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  console.log("✅ Admin user:", admin.email);

  // Leer datos del menu.json
  const menuPath = path.join(process.cwd(), "menu.json");
  const menuData = JSON.parse(fs.readFileSync(menuPath, "utf8"));

  console.log(`📋 Loading ${menuData.length} products from menu.json...`);

  // Mapear categorías según el tipo de producto
  function getCategoryFromName(name) {
    const categoryMap = {
      Tostadas: "Comida Rápida",
      Sandwich: "Comida Rápida",
      Empanadas: "Comida Rápida",
      Batidos: "Bebidas Frías",
      Tacos: "Comida Rápida",
      Pastas: "Comida Rápida",
      Sopes: "Comida Rápida",
      Quesadillas: "Comida Rápida",
      Burritos: "Comida Rápida",
    };
    return categoryMap[name] || "Comida Rápida";
  }

  // Generar descripción automática
  function generateDescription(name) {
    const descriptions = {
      Tostadas:
        "Deliciosas tostadas crujientes con diferentes tipos de carne y toppings frescos",
      Sandwich:
        "Sándwich gourmet preparado con ingredientes frescos y pan artesanal",
      Empanadas: "Empanadas horneadas con masa dorada y rellenos tradicionales",
      Batidos: "Batidos cremosos preparados con frutas frescas y naturales",
      Tacos:
        "Tacos tradicionales con tortillas hechas a mano y rellenos auténticos",
      Pastas:
        "Pastas frescas con salsas caseras y ingredientes de primera calidad",
      Sopes:
        "Sopes tradicionales con masa de maíz y variedad de rellenos mexicanos",
      Quesadillas:
        "Quesadillas doradas con queso derretido y rellenos deliciosos",
      Burritos:
        "Burritos grandes envueltos en tortilla de harina con rellenos abundantes",
    };
    return (
      descriptions[name] ||
      `Delicioso ${name.toLowerCase()} preparado con ingredientes frescos de la más alta calidad`
    );
  }

  // Procesar cada producto del menú
  for (const menuItem of menuData) {
    console.log(`🍽️ Processing: ${menuItem.name}...`);

    // Verificar si el producto ya existe
    const existing = await db.product.findFirst({
      where: { name: menuItem.name },
    });

    if (!existing) {
      // Crear el producto
      const product = await db.product.create({
        data: {
          name: menuItem.name,
          description: generateDescription(menuItem.name),
          category: getCategoryFromName(menuItem.name),
          image: "/sailorcoffee-1035.jpg", // Imagen por defecto (se actualizará después)
          stock: 50, // Stock por defecto
          isActive: true,
          featured: Math.random() > 0.7, // 30% de probabilidad de ser destacado
          hasVariants: true, // Todos estos productos tienen variantes
          price: null, // NULL porque tiene variantes
        },
      });

      // Crear las variantes
      let sortOrder = 1;
      for (const variant of menuItem.variants) {
        await db.productVariant.create({
          data: {
            productId: product.id,
            name: variant.name,
            price: variant.price,
            isDefault: sortOrder === 1, // La primera variante es la por defecto
            sortOrder: sortOrder,
            isActive: true,
          },
        });
        sortOrder++;
      }

      const defaultVariant = menuItem.variants[0];
      console.log(
        `✅ Created: ${product.name} - $${defaultVariant.price} (${
          defaultVariant.name
        }) + ${menuItem.variants.length - 1} more variants`
      );
    } else {
      console.log(`⏭️ Product exists: ${existing.name}`);
    }
  }

  // Agregar algunos productos simples adicionales (sin variantes)
  const simpleProducts = [
    {
      name: "Café Americano",
      description: "Café negro tradicional, fuerte y aromático",
      category: "Bebidas Calientes",
      price: 3.5,
      stock: 100,
    },
    {
      name: "Latte Vainilla",
      description: "Espresso con leche vaporizada y sirope de vainilla",
      category: "Bebidas Calientes",
      price: 4.75,
      stock: 80,
    },
    {
      name: "Agua Embotellada",
      description: "Agua purificada embotellada, fría y refrescante",
      category: "Bebidas Frías",
      price: 1.5,
      stock: 200,
    },
    {
      name: "Refresco de Cola",
      description: "Refresco de cola clásico, bien frío",
      category: "Bebidas Frías",
      price: 2.25,
      stock: 150,
    },
  ];

  console.log(
    `🥤 Adding ${simpleProducts.length} simple products (no variants)...`
  );

  for (const simpleProduct of simpleProducts) {
    const existing = await db.product.findFirst({
      where: { name: simpleProduct.name },
    });

    if (!existing) {
      await db.product.create({
        data: {
          name: simpleProduct.name,
          description: simpleProduct.description,
          category: simpleProduct.category,
          image: "/sailorcoffee-1035.jpg",
          stock: simpleProduct.stock,
          isActive: true,
          featured: false,
          hasVariants: false, // Productos simples
          price: simpleProduct.price, // Precio directo para productos sin variantes
        },
      });

      console.log(
        `✅ Created simple: ${simpleProduct.name} - $${simpleProduct.price}`
      );
    } else {
      console.log(`⏭️ Simple product exists: ${existing.name}`);
    }
  }

  // Crear un secuencial para las órdenes
  // await db.

  console.log("🎉 Database seeded successfully!");
  console.log(
    `📊 Total products processed: ${menuData.length + simpleProducts.length}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });

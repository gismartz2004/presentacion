const { db } = require("../src/lib/prisma.js");
const { nanoid } = require("nanoid");
const { normalizeDiscountCode } = require("../src/utils/discountRules");

async function getTenantIdByDomain(domain) {
  if (!domain) return null;
  try {
    console.log(`Fetching tenant for domain: ${domain}`);
    const tenant = await db.tenants.findFirst({
      where: { domain },
      select: { id: true },
    });
    return tenant ? tenant.id : null;
  } catch (error) {
    console.error(`Error fetching tenant for domain ${domain}:`, error);
    return null;
  }
}

// --- Funciones de Gating ---

async function getAvailableFeatures(tenantId) {
  if (!tenantId) return [];

  try {
    // const pf = await db.plan_features.findMany({
    //     where: { plan_id: 1 },
    //     include: { features: true }
    // });

    // console.log('PRUEBA: ' , pf);
    const tenant = await db.tenants.findUnique({
      where: { id: tenantId },
      include: {
        plan: {
          include: {
            plan_features: {
              where: { is_available: true },
              include: {
                features: true,
              },
            },
          },
        },
      },
    });

    console.log("Prisma: Retrieved tenant with plans:", tenant);

    if (!tenant?.plan) return [];

    return tenant.plan.plan_features;
  } catch (error) {
    console.error("Prisma Error al obtener características:", error);
    return [];
  }
}

async function hasAccessToFeature(tenantId, featureName) {
  if (!tenantId || !featureName) return false;

  const features = await getAvailableFeatures(tenantId);
  return features.map((pf) => pf.features.name).includes(featureName);
}

async function getDiscounts() {
  try {
    const discounts = await db.discounts.findMany({
      select: {
        id: true,
        percent: true,
        description: true,
        starts_at: true,
        ends_at: true,
        priority: true,
        stackable: true,
        code: true,
        code_auto_generated: true,
        max_uses: true,
        uses: true,

        discount_types: {
          select: {
            id: true,
            type_name: true,
            description: true,
          },
        },

        discounts_products: {
          select: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
      where: {
        is_active: true
      }
    });
    console.log(discounts);
    return discounts.map((d) => ({
      ...d,
      products: d.discounts_products.map((dp) => dp.products),
      discounts_products: undefined,
    }));
  } catch (error) {
    console.error("Error obteniendo descuentos:", error);
    throw new Error("No se pudieron obtener los descuentos");
  }
}

async function updateDiscountProducts(discountId, productIds) {
  try {
    // Eliminar asociaciones existentes
    await db.discounts_products.deleteMany({
      where: { discount_id: discountId },
    });

    // Crear nuevas asociaciones
    const createData = productIds.map((productId) => ({
      discount_id: discountId,
      product_id: productId,
    }));

    await db.discounts_products.createMany({
      data: createData,
    });

    console.log(`Updated products for discount ${discountId}`);
  } catch (error) {
    console.error(`Error updating products for discount ${discountId}:`, error);
    throw new Error("No se pudieron actualizar los productos del descuento");
  }
}

function assertPercentRange(percent) {
  if (percent == null) return;
  const p = Number(percent);
  if (!Number.isFinite(p) || p < 0 || p > 100) {
    throw new Error("El porcentaje debe estar entre 0 y 100");
  }
}

function generateRandomCode() {
  return nanoid(10).toUpperCase();
}

async function updateDiscounts({
  id,
  percent,
  description,
  discount_type,
  starts_at,
  ends_at,
  priority,
  stackable,
  code,
  generate_code,
  max_uses,
}) {
  try {
    assertPercentRange(percent);

    // Obtener descuento actual con tipo y productos
    const existing = await db.discounts.findUnique({
      where: { id },
      select: {
        discounts_products: true,
      },
    });

    if (!existing) {
      throw new Error("Descuento no encontrado");
    }

    // ----------------------------------------------------
    // Regla: NO permitir actualizar si:
    // 1) El tipo es "código de descuento"
    // 2) Tiene productos asociados
    // ----------------------------------------------------
    const ES_TIPO_CODIGO = discount_type === 2; // ajusta este ID

    if (ES_TIPO_CODIGO && existing.discounts_products.length > 0) {
      throw new Error(
        "No se puede actualizar a código de descuento porque tiene productos asociados"
      );
    }

    const normalizedCode = generate_code
      ? generateRandomCode()
      : normalizeDiscountCode(code);

    const updated = await db.discounts.update({
      where: { id },
      data: {
        percent,
        description,
        discount_types: { connect: { id: discount_type } },
        starts_at: starts_at ? new Date(starts_at) : null,
        ends_at: ends_at ? new Date(ends_at) : null,
        priority: priority != null ? Number(priority) : undefined,
        stackable: stackable != null ? Boolean(stackable) : undefined,
        code: normalizedCode,
        code_auto_generated: Boolean(generate_code),
        max_uses: max_uses != null ? Number(max_uses) : null,
      },
      select: {
        id: true,
        percent: true,
        description: true,
        starts_at: true,
        ends_at: true,
        priority: true,
        stackable: true,
        code: true,
        code_auto_generated: true,
        max_uses: true,
        uses: true,
        discount_types: {
          select: {
            id: true,
            type_name: true,
            description: true,
          },
        },

        discounts_products: {
          select: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return {
      ...updated,
      products: updated.discounts_products.map((dp) => dp.products),
      discounts_products: undefined,
    };
  } catch (error) {
    console.error("Error actualizando descuento:", error);

    const message =
      error.message && error.message.includes("productos asociados")
        ? error.message
        : "No se pudo actualizar el descuento";

    throw new Error(message);
  }
}

async function insertDiscounts({
  percent,
  description,
  discount_type,
  starts_at,
  ends_at,
  priority,
  stackable,
  code,
  generate_code,
  max_uses,
}) {
  try {
    assertPercentRange(percent);

    const normalizedCode = generate_code
      ? generateRandomCode()
      : normalizeDiscountCode(code);

    const newDiscount = await db.discounts.create({
      data: {
        percent,
        description,
        discount_types: { connect: { id: discount_type } },
        starts_at: starts_at ? new Date(starts_at) : null,
        ends_at: ends_at ? new Date(ends_at) : null,
        priority: priority != null ? Number(priority) : 0,
        stackable: Boolean(stackable),
        code: normalizedCode,
        code_auto_generated: Boolean(generate_code),
        max_uses: max_uses != null ? Number(max_uses) : null,
      },
      select: {
        id: true,
        percent: true,
        description: true,
        starts_at: true,
        ends_at: true,
        priority: true,
        stackable: true,
        code: true,
        code_auto_generated: true,
        max_uses: true,
        uses: true,
        discount_types: {
          select: {
            id: true,
            type_name: true,
            description: true,
          },
        },

        discounts_products: {
          select: {
            products: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });
    return {
      ...newDiscount,
      products: newDiscount.discounts_products.map((dp) => dp.products),
      discounts_products: undefined,
    };
  } catch (error) {
    console.error("Error insertando descuento:", error);
    throw new Error("No se pudo insertar el descuento");
  }
}

async function deleteDiscount(id) {
  try {
    const existing = await db.discounts.findUnique({
      where: { id },
      select: {
        discounts_products: true,
      },
    });

    if (!existing) {
      throw new Error("Descuento no encontrado");
    }

    await db.discounts.update({
      where: { id },
      data: {
        is_active: false
      },
    });
  } catch (error) {
    console.error("Error eliminando el descuento:", error);
    throw new Error("No se pudo eliminar el descuento");
  }
}

async function getDiscountTypes() {
  try {
    const discountTypes = await db.discount_types.findMany({
      select: {
        id: true,
        type_name: true,
        description: true,
      },
    });
    return discountTypes;
  } catch (error) {
    console.error("Error obteniendo tipos de descuento:", error);
    throw new Error("No se pudieron obtener los tipos de descuento");
  }
}

module.exports = {
  getTenantIdByDomain, // Mantenemos esta para el authMiddleware
  hasAccessToFeature,
  getAvailableFeatures,
  getDiscounts,
  updateDiscountProducts,
  getDiscountTypes,
  updateDiscounts,
  insertDiscounts,
  deleteDiscount,
};

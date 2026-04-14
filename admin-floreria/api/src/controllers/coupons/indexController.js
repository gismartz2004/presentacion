const { db } = require("../../lib/prisma.js");
const { nanoid } = require("nanoid");

/**
 * Get all coupons
 */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await db.coupons.findMany({
      orderBy: { createdAt: "desc" },
    });
    return res.status(200).json({
      status: "success",
      data: coupons,
    });
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener los cupones",
    });
  }
};

/**
 * Get a single coupon by ID
 */
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await db.coupons.findUnique({
      where: { id },
    });

    if (!coupon) {
      return res.status(404).json({
        status: "error",
        message: "Cupón no encontrado",
      });
    }

    return res.status(200).json({
      status: "success",
      data: coupon,
    });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al obtener el cupón",
    });
  }
};

/**
 * Create a new coupon
 */
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      type,
      value,
      minAmount,
      validFrom,
      validUntil,
      maxUsesPerCustomer,
      maxUsesTotal,
      isActive,
    } = req.body;

    // Validate if code already exists
    const existingCoupon = await db.coupons.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return res.status(400).json({
        status: "error",
        message: "El código de cupón ya existe",
      });
    }

    const coupon = await db.coupons.create({
      data: {
        id: nanoid(),
        code: code.toUpperCase(),
        type,
        value: parseFloat(value),
        minAmount: minAmount ? parseFloat(minAmount) : null,
        validFrom: new Date(validFrom),
        validUntil: new Date(validUntil),
        maxUsesPerCustomer: parseInt(maxUsesPerCustomer) || 1,
        maxUsesTotal: maxUsesTotal ? parseInt(maxUsesTotal) : null,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
      },
    });

    return res.status(201).json({
      status: "success",
      message: "Cupón creado correctamente",
      data: coupon,
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al crear el cupón",
    });
  }
};

/**
 * Update a coupon
 */
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      type,
      value,
      minAmount,
      validFrom,
      validUntil,
      maxUsesPerCustomer,
      maxUsesTotal,
      isActive,
    } = req.body;

    const existingCoupon = await db.coupons.findUnique({
      where: { id },
    });

    if (!existingCoupon) {
      return res.status(404).json({
        status: "error",
        message: "Cupón no encontrado",
      });
    }

    const updatedCoupon = await db.coupons.update({
      where: { id },
      data: {
        code: code ? code.toUpperCase() : undefined,
        type,
        value: value ? parseFloat(value) : undefined,
        minAmount: minAmount !== undefined ? (minAmount ? parseFloat(minAmount) : null) : undefined,
        validFrom: validFrom ? new Date(validFrom) : undefined,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        maxUsesPerCustomer: maxUsesPerCustomer ? parseInt(maxUsesPerCustomer) : undefined,
        maxUsesTotal: maxUsesTotal !== undefined ? (maxUsesTotal ? parseInt(maxUsesTotal) : null) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
        updatedAt: new Date(),
      },
    });

    return res.status(200).json({
      status: "success",
      message: "Cupón actualizado correctamente",
      data: updatedCoupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar el cupón",
    });
  }
};

/**
 * Delete a coupon
 */
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.coupons.delete({
      where: { id },
    });

    return res.status(200).json({
      status: "success",
      message: "Cupón eliminado correctamente",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return res.status(500).json({
      status: "error",
      message: "Error al eliminar el cupón",
    });
  }
};

/**
 * Generate a random coupon code
 */
exports.generateCode = async (req, res) => {
  try {
    const code = nanoid(8).toUpperCase();
    return res.status(200).json({
      status: "success",
      data: { code },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al generar el código",
    });
  }
};

const { getDiscounts, updateDiscountProducts, getDiscountTypes, updateDiscounts, insertDiscounts, deleteDiscount } = require("../../../prisma/prisma-service");

exports.getDiscounts = async (req, res) => {
  try {
    const result = await getDiscounts();
    // Lógica para obtener descuentos
    res.status(200).json({ message: "Lista de descuentos", data: result });
  } catch (error) {
    console.error("Error obteniendo descuentos:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los descuentos"
    });
  }
};

exports.deleteDiscounts = async (req, res) => {
  try {
    const  discountId  = Number(req.params.id);
    await deleteDiscount(discountId);

    const discounts = await getDiscounts();
    res.status(200).json({ message: "Descuento eliminado", status: "success", data : discounts });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "No se pudo eliminar el descuento",
      data: null
    });
  }
} 

exports.updateDiscountProducts = async (req, res) => {
  const  discountId  = Number(req.params.id);
  const { productIds } = req.body;

  try {
    await updateDiscountProducts(discountId, productIds);
    res.status(200).json({ message: "Productos del descuento actualizados correctamente", status: "success" });
  } catch (error) {
    console.error(`Error updating products for discount ${discountId}:`, error);
    res.status(500).json({
      status: "error",
      message: "No se pudieron actualizar los productos del descuento"
    });
  }
};

exports.getDiscountTypes = async (req, res) => {
  try {
    const discountTypes = await getDiscountTypes();
    res.status(200).json({ message: "Lista de tipos de descuento", data: discountTypes });
  } catch (error) {
    console.error("Error obteniendo tipos de descuento:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: "No se pudieron obtener los tipos de descuento"
    });
  }
};

exports.updateDiscounts = async (req, res) => {
  const {
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
  } = req.body;

  try {
    const updatedDiscount = await updateDiscounts({
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
    });
    res.status(200).json({ message: "Descuento actualizado correctamente", data: updatedDiscount, status: "success" });
  } catch (error) {
     // Si el error es de negocio, envía 400
    if (error.message.includes("productos asociados")) {
      return res.status(400).json({
        status: "error",
        message: error.message,
        data: null
      });
    }

    return res.status(500).json({
      status: "error",
      message: "No se pudo actualizar el descuento",
      error: error.message,
      data: null
    });
  }
};

exports.insertDiscounts = async (req, res) => {
    const {
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
    } = req.body;

    try {
        const newDiscount = await insertDiscounts({
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
        });
        res.status(201).json({ message: "Descuento creado correctamente", data: newDiscount, status: "success" });
    } catch (error) {
        console.error("Error creando descuento:", error);
        res.status(500).json({
            status: "error",
            message: "No se pudo crear el descuento",
            error: error.message,
            data: null
        });
    }
};
const { db: prisma } = require("../../lib/prisma");

exports.getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await prisma.productVariant.findMany({
      where: { productId }
    });
    return res.status(200).json({ variants });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener variantes' });
  }
};

exports.createVariant = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, price, isActive, isDefault, sortOrder } = req.body;
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name,
        price,
        isActive,
        isDefault,
        sortOrder
      }
    });
    return res.status(201).json({ variant });
  } catch (error) {
    return res.status(500).json({ error: 'Error al crear variante' });
  }
};

exports.updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const data = req.body;
    const variant = await prisma.productVariant.update({
      where: { id: variantId },
      data
    });
    return res.status(200).json({ variant });
  } catch (error) {
    return res.status(500).json({ error: 'Error al actualizar variante' });
  }
};

exports.deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    await prisma.productVariant.delete({
      where: { id: variantId }
    });
    return res.status(200).json({ message: 'Variante eliminada' });
  } catch (error) {
    return res.status(500).json({ error: 'Error al eliminar variante' });
  }
};

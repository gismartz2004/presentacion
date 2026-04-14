const express = require('express');
const { db: prisma } = require('../../lib/prisma');

const router = express.Router();

/**
 * GET /api/external/products
 * Route pública para que la tienda pueda obtener productos activos.
 * No requiere autenticación de admin.
 */
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;

    const where = { isActive: true, isDeleted: false };
    if (category) where.category = category;
    if (featured === 'true') where.featured = true;

    const products = await prisma.product.findMany({
      where,
      include: {
        variants: {
          where: { isActive: true, isDeleted: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
    });

    const data = products.map((p) => {
      const defaultVariant = p.variants.find((v) => v.isDefault) || p.variants[0];
      const price = p.hasVariants ? defaultVariant?.price : p.price;

      // Calcular si es best seller (featured)
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        price: price ? `$${Number(price).toFixed(2)}` : '$0.00',
        rawPrice: price || 0,
        image: p.image || '',
        category: p.category,
        isBestSeller: p.featured,
        stock: p.stock,
        hasVariants: p.hasVariants,
        variants: p.variants.map((v) => ({
          id: v.id,
          name: v.name,
          price: v.price,
          isDefault: v.isDefault,
        })),
        deliveryTime: '2-3 horas',
        size: '-',
        includes: p.description || '',
      };
    });

    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('External products error:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

/**
 * GET /api/external/products/categories
 * Retorna la lista única de categorías activas para los filtros de la boutique.
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await prisma.product.findMany({
      where: { isActive: true, isDeleted: false },
      select: { category: true },
      distinct: ['category'],
    });

    const data = categories
      .map((c) => c.category)
      .filter((c) => c && c.trim() !== "");

    return res.status(200).json({ status: 'success', data });
  } catch (error) {
    console.error('External categories error:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

module.exports = router;

const express = require('express');
const { db: prisma } = require('../../lib/prisma');

const router = express.Router();

/**
 * GET /api/external/reviews
 * Obtener reseñas activas de la empresa DIFIORI.
 */
router.get('/', async (req, res) => {
  try {
    // Usamos el ID de empresa que ya verificamos anteriormente
    const companyId = "cmnnzkgvl0000dpy8cj69hkg7";
    
    const reviews = await prisma.review.findMany({
      where: { 
        companyId,
        isActive: true 
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return res.status(200).json({ status: 'success', data: reviews });
  } catch (error) {
    console.error('External reviews error:', error);
    // Si la tabla aún no existe en el cliente generado, devolvemos array vacío para no romper la web
    return res.status(200).json({ status: 'success', data: [] });
  }
});

/**
 * POST /api/external/reviews
 * Enviar una nueva reseña desde la web.
 */
router.post('/', async (req, res) => {
  try {
    const { name, content, stars, role } = req.body;
    const companyId = "cmnnzkgvl0000dpy8cj69hkg7";

    if (!name || !content || !stars) {
      return res.status(400).json({ status: 'error', message: 'Datos incompletos' });
    }

    const newReview = await prisma.review.create({
      data: {
        name,
        content,
        stars: parseInt(stars),
        role: role || "Cliente",
        companyId,
        isActive: true // Por ahora las activamos por defecto
      }
    });

    return res.status(201).json({ status: 'success', data: newReview });
  } catch (error) {
    console.error('Create review error:', error);
    return res.status(500).json({ status: 'error', message: 'Error al guardar la reseña' });
  }
});

module.exports = router;

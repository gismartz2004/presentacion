const express = require('express');
const { db: prisma } = require('../../lib/prisma');

const router = express.Router();

/**
 * GET /api/external/cms/home-hero
 * Retorna la configuración activa del Banner/Hero para la boutique.
 */
router.get('/home-hero', async (req, res) => {
  try {
    const { lang = 'es' } = req.query;
    
    const hero = await prisma.home_hero.findFirst({
      where: { lang },
      orderBy: { createdAt: 'desc' },
    });

    if (!hero) {
      return res.status(200).json({ status: 'success', data: null });
    }

    return res.status(200).json({ status: 'success', data: hero });
  } catch (error) {
    console.error('External CMS Hero error:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

module.exports = router;

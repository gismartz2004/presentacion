const express = require('express');
const { db: prisma } = require('../../lib/prisma');

const router = express.Router();

/**
 * GET /api/external/company
 * Route pública para obtener información básica de la floristería.
 */
router.get('/', async (req, res) => {
  try {
    // Buscamos la primera empresa (o la principal)
    const company = await prisma.company.findFirst({
      where: { isActive: true },
      select: {
        name: true,
        email: true,
        phone: true,
        address: true,
        logo: true,
        settings: true
      }
    });

    if (!company) {
      return res.status(200).json({ 
        status: 'success', 
        data: {
          name: "DIFIORI",
          email: "ventas@difiori.com.ec",
          phone: "+(593) 099 7984 583",
          address: "Guayaquil, Ecuador"
        } 
      });
    }

    return res.status(200).json({ status: 'success', data: company });
  } catch (error) {
    console.error('External company error:', error);
    return res.status(500).json({ status: 'error', message: 'Error interno del servidor' });
  }
});

module.exports = router;

const express = require('express');
const { createExternalOrder, getOrdersStatus } = require('../../controllers/external/ordersController');
const { apiKeyMiddleware, addStartTime } = require('../../middlewares/apiKeyMiddleware');
const { webhookVerificationMiddleware } = require('../../middlewares/webhookMiddleware');

const router = express.Router();

// Middleware global para todas las rutas externas
router.use(addStartTime);

/**
 * POST /api/external/orders
 * Crear nueva orden desde web externa
 */
router.post('/orders', [
  webhookVerificationMiddleware,
  apiKeyMiddleware,
  createExternalOrder
]);

/**
 * GET /api/external/orders/status
 * Obtener estados de órdenes específicas
 */
router.get('/orders/status', [
  apiKeyMiddleware,
  getOrdersStatus
]);

module.exports = router;
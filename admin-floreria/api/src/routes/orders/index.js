const express = require('express');
const router = express.Router();
const ordersController = require('../../controllers/orders/indexController');

// Obtener todas las órdenes
router.get('/', ordersController.getAllOrders);

// Crear una orden
router.post('/', ordersController.createOrder);

module.exports = router;

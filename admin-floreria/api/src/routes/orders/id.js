const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orders/idController");

// Obtener orden por ID
router.get("/:id", orderController.getOrderById);

// Actualizar orden por ID
router.put("/:id", orderController.updateOrderById);

// Actualizar estado de orden por ID
router.patch("/:id/status", orderController.updateStateOrderById);

// Eliminar orden por ID
router.delete("/:id", orderController.deleteOrderById);

module.exports = router;

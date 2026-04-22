const express = require("express");
const router = express.Router();
const orderController = require("../../controllers/orders/idController");

// Obtener orden por ID
router.get("/:id", orderController.getOrderById);
router.get("/:id/payment-proof/image", orderController.getPaymentProofImage);

// Actualizar orden por ID
router.put("/:id", orderController.updateOrderById);

// Actualizar estado de orden por ID
router.patch("/:id/status", orderController.updateStateOrderById);

// Actualizar estado de pago por ID
router.patch("/:id/payment-status", orderController.updatePaymentStatus);

// Actualizar estado del comprobante por ID
router.patch("/:id/payment-proof", orderController.updatePaymentProof);

// Eliminar orden por ID
router.delete("/:id", orderController.deleteOrderById);

module.exports = router;

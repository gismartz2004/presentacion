const express = require('express');
const router = express.Router();
const stripeWebhookController = require('../../controllers/webhook/stripeController');

// Endpoint para recibir eventos de Stripe
router.post('/', stripeWebhookController.handleStripeWebhook);

module.exports = router;

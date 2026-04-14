const express = require('express');
const router = express.Router();
const checkoutController = require('../../controllers/checkout/indexController');

// Endpoint para procesar checkout
router.post('/', checkoutController.processCheckout);
router.post('/saveEmailSuscription', checkoutController.saveEmailSuscription);
router.get('/get-percent-discount', checkoutController.getDiscount)
router.post('/validate-use-discount-code', checkoutController.validateUseDiscountCode);
router.get('/get-coupon-discount', checkoutController.getCouponDiscount);

module.exports = router;

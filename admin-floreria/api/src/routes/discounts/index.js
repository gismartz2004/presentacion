const express = require('express');
const router = express.Router();
const discountsController = require('../../controllers/discounts/indexController');

router.get('/', discountsController.getDiscounts);
router.put('/:id/products', discountsController.updateDiscountProducts);
router.get('/types', discountsController.getDiscountTypes);
router.put('/', discountsController.updateDiscounts);
router.post('/', discountsController.insertDiscounts);
router.put('/:id', discountsController.deleteDiscounts)

module.exports = router;
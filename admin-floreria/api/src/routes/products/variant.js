const express = require('express');
const router = express.Router();
const variantController = require('../../controllers/products/variantController');

// Obtener variantes de un producto
router.get('/:productId/variants', variantController.getVariantsByProduct);

// Crear variante para un producto
router.post('/:productId/variants', variantController.createVariant);

// Actualizar variante
router.put('/variants/:variantId', variantController.updateVariant);

// Eliminar variante
router.delete('/variants/:variantId', variantController.deleteVariant);

module.exports = router;

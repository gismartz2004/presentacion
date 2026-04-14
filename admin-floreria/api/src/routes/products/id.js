const express = require('express');
const router = express.Router();
const productController = require('../../controllers/products/idController');

// Obtener producto por ID
router.get('/:id', productController.getProductById);

// Actualizar producto por ID
router.put('/:id', productController.updateProductById);

// // Actualizar estado de producto por ID
// router.patch('/:id/status', productController.updateStateProductById);

// Eliminar producto por ID
router.delete('/:id', productController.deleteProductById);

module.exports = router;

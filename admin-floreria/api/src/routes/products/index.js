const express = require('express');
const router = express.Router();
const productsController = require('../../controllers/products/indexController');

// Obtener productos destacados
router.get('/featured', productsController.getProductsFeatured);

// Obtener todos los productos
router.get('/', productsController.getAllProducts);

// Crear un producto
router.post('/', productsController.createProduct);

// Obtener filtros de un producto
router.get('/:productId/filters', productsController.getProductFilters);

module.exports = router;

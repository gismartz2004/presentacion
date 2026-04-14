const express = require('express');
const router = express.Router();
const filterCategoriesController = require('../../controllers/filters/category-controller');
const filterOptionsController = require('../../controllers/filters/option-controller');

// Rutas para categorías de filtros
router.post('/categories', filterCategoriesController.CreateCategory);
router.get('/categories', filterCategoriesController.GetCategories);
router.get('/categories/:id', filterCategoriesController.GetCategoryById);
router.put('/categories/:id', filterCategoriesController.UpdateCategory);
router.delete('/categories/:id', filterCategoriesController.DeleteCategory);

// Rutas para opciones de filtros
router.post('/options', filterOptionsController.CreateOption);
router.get('/options', filterOptionsController.GetAllOptions);
router.get('/options/categories/:categoryId', filterOptionsController.GetOptionsByCategory);
router.put('/options/:id', filterOptionsController.UpdateOption);
router.delete('/options/:id', filterOptionsController.DeleteOption);

module.exports = router;

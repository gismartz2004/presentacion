const express = require('express');
const router = express.Router();
const companyController = require('../../controllers/cms/home/HomeController');

// Endpoint para obtener información del Hero de la página de inicio
router.get('/home', companyController.getHomeHero);
router.get('/home-hero', companyController.getHomeHero); // Alias for consistency
router.get('/home-timeline/:lang', companyController.getHomeHero); // Mocking for now
router.get('/home-craftsmanship', companyController.getHomeHero); // Mocking for now
router.get('/featured-products', companyController.getFeaturedProducts);
router.get('/limited-products', companyController.getFeaturedProducts); // Mocking for now

// Endpoint para crear el Hero de la página de inicio
router.post('/home', companyController.createHomeHero);
// Endpoint para actualizar el Hero de la página de inicio
router.put('/home/:id', companyController.updateHomeHero);

module.exports = router;
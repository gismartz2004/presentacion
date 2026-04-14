const express = require('express');
const router = express.Router();
const chartDataController = require('../../controllers/chart-data/indexController');

// Endpoint para obtener datos de gráficos
router.get('/', chartDataController.getChartData);

module.exports = router;

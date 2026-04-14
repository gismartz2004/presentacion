const express = require('express');
const router = express.Router();
const statesmanController = require('../../controllers/statesman/indexController');

// Endpoint para obtener datos de statesman
router.get('/', statesmanController.getStatesmanData);

module.exports = router;

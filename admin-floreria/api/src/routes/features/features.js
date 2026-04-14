const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/meController');

router.get('/get-features', adminController.features);

module.exports = router;
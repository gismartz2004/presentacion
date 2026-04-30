const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/meController');

router.get('/', adminController.me);
router.get('/features', adminController.features);

module.exports = router;

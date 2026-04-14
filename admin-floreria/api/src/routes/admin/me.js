const express = require('express');
const router = express.Router();
const adminController = require('../../controllers/admin/meController');

router.get('/', adminController.me);

module.exports = router;

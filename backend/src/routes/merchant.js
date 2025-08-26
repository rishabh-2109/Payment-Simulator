const express = require('express');
const router = express.Router();
const { registerMerchant } = require('../controllers/merchantController');

router.post('/register', registerMerchant);

module.exports = router;

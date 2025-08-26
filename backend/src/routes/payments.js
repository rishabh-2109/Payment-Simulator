const express = require('express');
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const idempotency = require('../middleware/idempotency');
const { initiatePayment, getPayment, paymentCallback, refundPayment } = require('../controllers/paymentController');

router.post('/initiate', rateLimiter, idempotency, initiatePayment);
router.get('/:id', rateLimiter, getPayment);
router.post('/:id/callback', rateLimiter, paymentCallback);
router.post('/:id/refund', rateLimiter, refundPayment);

module.exports = router;

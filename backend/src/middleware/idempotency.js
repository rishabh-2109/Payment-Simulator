const Transaction = require('../models/Transaction');

async function idempotencyMiddleware(req, res, next) {
 
  const key = req.header('idempotency-key');
  if (!key) return next();

  const merchantId = (req.merchant && req.merchant._id) || req.body.merchantId;
  if (!merchantId) return res.status(400).json({ error: 'Merchant required for idempotency' });

  const existing = await Transaction.findOne({ merchantId, idempotencyKey: key });
  if (existing) {
   
    return res.status(200).json({ message: 'Idempotent - returning existing transaction', transaction: existing });
  }
 
  req.idempotencyKey = key;
  next();
}

module.exports = idempotencyMiddleware;

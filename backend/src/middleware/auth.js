const Merchant = require('../models/Merchant');

async function apiKeyAuth(req, res, next) {
   const apiKey = req.header('x-api-key');
  if (!apiKey) {
      return next();
  }
  const merchant = await Merchant.findOne({ apiKey });
  if (!merchant) return res.status(401).json({ error: 'Invalid API key' });
  req.merchant = merchant;
  next();
}

module.exports = apiKeyAuth;

// src/controllers/merchantController.js
const Merchant = require('../models/Merchant');
const { v4: uuidv4 } = require('uuid');

async function registerMerchant(req, res) {
  const { name, callbackUrl } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });

  const apiKey = 'mk_' + uuidv4().replace(/-/g, '');
  const m = new Merchant({ name, callbackUrl, apiKey });
  await m.save();
  res.json({ message: 'merchant created', merchant: { id: m._id, name: m.name, apiKey: m.apiKey } });
}

module.exports = { registerMerchant };

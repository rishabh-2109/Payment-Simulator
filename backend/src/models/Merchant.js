const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MerchantSchema = new Schema({
  name: { type: String, required: true },
  callbackUrl: { type: String },
  apiKey: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Merchant', MerchantSchema);

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RefundSchema = new Schema({
  refundId: { type: String, required: true, unique: true },
  transactionId: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','SUCCESS','FAILED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Refund', RefundSchema);

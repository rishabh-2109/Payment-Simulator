const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  transactionId: { type: String, required: true, unique: true },
  merchantId: { type: Schema.Types.ObjectId, ref: 'Merchant', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['PENDING','SUCCESS','FAILED','REFUNDED'], default: 'PENDING' },
  metadata: { type: Object },
  idempotencyKey: { type: String }, 
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
TransactionSchema.index({ merchantId: 1, idempotencyKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Transaction', TransactionSchema);

// src/controllers/paymentController.js
const Transaction = require('../models/Transaction');
const Refund = require('../models/Refund');
const { generateTransactionId } = require('../utils/generateId');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

async function initiatePayment(req, res) {
  const { amount, metadata } = req.body;
  const merchant = req.merchant || (req.body.merchantId && { _id: req.body.merchantId });
  if (!merchant) return res.status(400).json({ error: 'Merchant required (x-api-key header or merchantId in body).' });
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount' });

  // idempotencyKey from middleware
  const idempotencyKey = req.idempotencyKey;

  const txnId = generateTransactionId();
  const txn = new Transaction({
    transactionId: txnId,
    merchantId: merchant._id,
    amount,
    metadata: metadata || {},
    idempotencyKey: idempotencyKey || undefined
  });

  await txn.save();

  // return a simulated paymentPage link (frontend will hit callback to simulate)
  const paymentPageUrl = `${req.protocol}://${req.get('host')}/simulate/pay/${txn.transactionId}`;

  res.status(201).json({
    message: 'payment initiated',
    transaction: {
      transactionId: txn.transactionId,
      amount: txn.amount,
      status: txn.status,
      paymentPage: paymentPageUrl
    }
  });
}

async function getPayment(req, res) {
  const id = req.params.id;
  const txn = await Transaction.findOne({ transactionId: id });
  if (!txn) return res.status(404).json({ error: 'Not found' });
  res.json({ transaction: txn });
}

/**
 * Simulated callback: external payment provider calls this endpoint to notify success/failure.
 * For demo, you can call it from frontend to set SUCCESS or FAILED.
 */
async function paymentCallback(req, res) {
  const id = req.params.id;
  const { status } = req.body; // expected SUCCESS or FAILED
  if (!['SUCCESS','FAILED'].includes(status)) return res.status(400).json({ error: 'Invalid status' });

  const txn = await Transaction.findOneAndUpdate({ transactionId: id }, { status, updatedAt: new Date() }, { new: true });
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  // Optionally call merchant callback URL:
  // (Not failing if merchant callback not reachable)
  const Merchant = require('../models/Merchant');
  try {
    const m = await Merchant.findById(txn.merchantId);
    if (m && m.callbackUrl) {
      // fire and forget
      axios.post(m.callbackUrl, { transactionId: txn.transactionId, status: txn.status, amount: txn.amount }).catch((e) => {
        console.warn('Merchant callback failed', e.message);
      });
    }
  } catch (e) {
    console.warn('Error while calling merchant callback', e.message);
  }

  res.json({ message: 'transaction updated', transaction: txn });
}

async function refundPayment(req, res) {
  const id = req.params.id;
  const { amount } = req.body;
  const txn = await Transaction.findOne({ transactionId: id });
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });

  if (txn.status !== 'SUCCESS') return res.status(400).json({ error: 'Only successful transactions can be refunded' });

  // simple refund creation
  const refundId = 'refund_' + uuidv4();
  const refund = new Refund({ refundId, transactionId: txn.transactionId, amount, status: 'SUCCESS' });
  await refund.save();

  // Mark transaction as refunded (demo: full refund)
  txn.status = 'REFUNDED';
  await txn.save();

  res.json({ message: 'refund processed', refund });
}

module.exports = { initiatePayment, getPayment, paymentCallback, refundPayment };

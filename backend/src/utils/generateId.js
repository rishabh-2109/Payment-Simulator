const { v4: uuidv4 } = require('uuid');

function generateTransactionId() {
  return 'txn_' + uuidv4();
}
module.exports = { generateTransactionId };

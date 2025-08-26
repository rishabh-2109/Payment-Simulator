require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const merchantRoutes = require('./routes/merchant');
const paymentRoutes = require('./routes/payments');
const { createRedis } = require('./utils/redisClient');
const apiKeyAuth = require('./middleware/auth');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

createRedis(process.env.REDIS_URL);

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/payment_sim').catch(err => {
  console.error('DB connection failed', err);
  process.exit(1);
});

app.get('/simulate/pay/:txnId', async (req, res) => {
  
  const txnId = req.params.txnId;
  res.send(`
    <html>
      <body>
        <h2>Simulated Payment Page</h2>
        <p>Transaction: ${txnId}</p>
        <button onclick="fetch('/api/payments/${txnId}/callback', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'SUCCESS'})}).then(()=>alert('SUCCESS'))">Simulate SUCCESS</button>
        <button onclick="fetch('/api/payments/${txnId}/callback', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({status:'FAILED'})}).then(()=>alert('FAILED'))">Simulate FAILED</button>
      </body>
    </html>
  `);
});

app.use(apiKeyAuth); 
app.use('/api/merchants', merchantRoutes);
app.use('/api/payments', paymentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));

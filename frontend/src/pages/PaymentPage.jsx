import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
const BASE_URL=import.meta.env.MODE==="development"?'http://localhost:4000/api' :'/api'

export default function PaymentPage({ apiKey }){
  const [amount, setAmount] = useState(100);
  const [txn, setTxn] = useState(null);
  const [status, setStatus] = useState(null);

  async function initiate(e){
    e.preventDefault();
    const idempotency = uuidv4();
    const resp = await fetch(`${BASE_URL}/payments/initiate`, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-api-key': apiKey || '',
        'idempotency-key': idempotency
      },
      body: JSON.stringify({ amount })
    });
    const data = await resp.json();
    if (data.transaction) {
      setTxn(data.transaction);
      setStatus(data.transaction.status);
    } else {
      alert('Error: ' + JSON.stringify(data));
    }
  }

  async function openPaymentPage(){
    if (!txn) return;
    window.open(txn.paymentPage, '_blank');
  }

  async function pollStatus(){
    if (!txn) return;
    const resp = await fetch(`${BASE_URL}/payments/${txn.transactionId}`);
    const data = await resp.json();
    if (data.transaction) {
      setStatus(data.transaction.status);
    } else {
      alert('Error: ' + JSON.stringify(data));
    }
  }

  return (
    <div>
      <h2>Initiate Payment</h2>
      <form onSubmit={initiate}>
        <input type="number" value={amount} onChange={e=>setAmount(Number(e.target.value))} min="1" />
        <button type="submit">Initiate</button>
      </form>

      {txn && (
        <div style={{marginTop:10}}>
          <div><strong>Txn ID:</strong> {txn.transactionId}</div>
          <div><strong>Amount:</strong> {txn.amount}</div>
          <div><strong>Status:</strong> {status}</div>
          <button onClick={openPaymentPage}>Open Simulated Payment Page</button>
          <button onClick={pollStatus} style={{marginLeft:10}}>Poll Status</button>
        </div>
      )}
    </div>
  );
}

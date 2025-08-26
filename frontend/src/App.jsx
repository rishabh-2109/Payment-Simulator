import React, { useState } from 'react';
import MerchantRegister from './pages/MerchantRegister';
import PaymentPage from './pages/PaymentPage';

export default function App(){
  const [apiKey, setApiKey] = useState('');
  return (
    <div style={{padding:20, fontFamily:'Arial'}}>
      <h1>Payment Gateway / UPI Simulator</h1>
      <MerchantRegister onCreated={(key)=>setApiKey(key)} />
      <hr />
      <PaymentPage apiKey={apiKey} />
    </div>
  );
}

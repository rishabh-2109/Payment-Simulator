import React, { useState } from 'react';

const BASE_URL=import.meta.env.MODE==="development"?'http://localhost:4000/api' :'/api';

export default function MerchantRegister({ onCreated }){
  const [name, setName] = useState('');
  const [callback, setCallback] = useState('');
  const [merchant, setMerchant] = useState(null);


  async function submit(e){
    e.preventDefault();
    const resp = await fetch(`${BASE_URL}/merchants/register`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ name, callbackUrl: callback })
    });
    const data = await resp.json();
    if (data.merchant) {
      setMerchant(data.merchant);
      onCreated(data.merchant.apiKey);
    } else {
      alert('Error: ' + JSON.stringify(data));
    }
  }

  return (
    <div>
      <h2>Register Merchant</h2>
      <form onSubmit={submit}>
        <input placeholder="Merchant name" value={name} onChange={e=>setName(e.target.value)} required/>
        <input placeholder="Callback URL (optional)" value={callback} onChange={e=>setCallback(e.target.value)} />
        <button type="submit">Register</button>
      </form>
      {merchant && (
        <div style={{marginTop:10}}>
          <strong>API Key:</strong> {merchant.apiKey}
        </div>
      )}
    </div>
  );
}

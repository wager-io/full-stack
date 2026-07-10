import React from 'react'

export default function CoinMixing() {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '50px auto',
      padding: '30px',
      // backgroundColor: '#f9f9f9',
      borderRadius: '10px',
      fontFamily: 'Arial, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
    }}>
      <h2 style={{ fontSize: '30px', marginBottom: '20px', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
        Coin Mixing Policy
      </h2>
      <p style={{ fontSize: '18px', lineHeight: '1.6' }}>
        Wagering requirements are in place to comply with our Anti-Money Laundering (AML) policy.
        To withdraw, or tip funds, you must wager at least <strong>1x the total amount of your deposit</strong>.
        If you need any assistance or have questions, our support team is here to help.
      </p>
    </div>
  );
};



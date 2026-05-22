import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
      padding: '20px'
    }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '36px', marginBottom: '10px' }}>DeliverX</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
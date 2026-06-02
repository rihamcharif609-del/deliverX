import React from 'react';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div  style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(160deg, #06091a 0%, #0d1b3e 50%, #0a1628 100%)'
      }}>

         {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url('/download2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          filter: 'blur(8px)',
          transform: 'scale(1.06)',
          opacity: 0.38
        }}
      />
   {/* Card */}
      <div
        className="card"
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '460px',
          width: '100%',
          padding: '40px 34px',
          borderRadius: '28px',
          background: 'rgba(255,255,255,0.10)',
          border: '1px solid rgba(255,255,255,0.14)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1
            style={{
              color: '#ffffff',
              fontSize: '40px',
              marginBottom: '10px',
              fontWeight: 800,
              letterSpacing: '-1px'
            }}
          >
            DeliverX
          </h1>

          <h2
            style={{
              fontSize: '28px',
              marginBottom: '8px',
              color: '#ffffff',
              fontWeight: 700
            }}
          >
            {title}
          </h2>

          <p
            style={{
              color: 'rgba(255,255,255,0.72)',
              fontSize: '15px'
            }}
          >
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
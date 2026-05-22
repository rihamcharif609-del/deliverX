import React from 'react';
import MainLayout from '../layouts/MainLayout';

const VerificationPending = ({ navigateTo }) => {
  return (
    <MainLayout userRole="courier" activePage="verification" onNavigate={navigateTo} 
  >
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div className="card" style={{
          maxWidth: '500px',
          textAlign: 'center',
          padding: '50px'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>
            Your Account is Under Review
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            Thank you for registering as a courier with DeliverX. Our team is currently reviewing your documents and verifying your information.
          </p>
          
          <div style={{
            background: '#fff7ed',
            borderLeft: '4px solid #f59e0b',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            <p style={{ fontWeight: '500', marginBottom: '10px' }}>📋 Required Documents:</p>
            <ul style={{ marginLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>CIN Card Image</li>
              <li>Driver License Image</li>
              <li>Vehicle Image</li>
              <li>Complete Profile Information</li>
            </ul>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', fontSize: '14px' }}>
            Once verified, you'll be able to access available deliveries and start earning. This usually takes 24-48 hours.
          </p>

          <button 
            className="btn btn-primary"
            onClick={() => navigateTo('courier-profile')}
            style={{ marginRight: '10px' }}
          >
            Complete Your Profile
          </button>
          
          <button 
            className="btn btn-outline"
            onClick={() => navigateTo('courier')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerificationPending;
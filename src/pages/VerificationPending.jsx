import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useCourierVerification } from '../context/CourierVerificationContext';

const VerificationPending = () => {
  const navigate = useNavigate();
  const { verificationStatus, verification } = useCourierVerification();

  return (
    <MainLayout userRole="courier" activePage="verification">
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <div
          className="card"
          style={{
            maxWidth: '520px',
            textAlign: 'center',
            padding: '50px',
          }}
        >
          <div style={{ fontSize: '80px', marginBottom: '20px' }}>
            {verificationStatus === 'rejected' ? '❌' : '⏳'}
          </div>
          <h2 style={{ marginBottom: '15px', color: 'var(--text-primary)' }}>
            {verificationStatus === 'rejected'
              ? 'Verification Rejected'
              : verificationStatus === 'draft'
                ? 'Complete Your Verification'
                : 'Your Account is Under Review'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            {verificationStatus === 'rejected' ? (
              <>
                {verification.rejectionReason || 'Your documents were not approved.'}
                <br />
                Please update your files and submit again.
              </>
            ) : verificationStatus === 'draft' ? (
              'Upload your CIN, driver license, and vehicle photo in your profile, then submit for admin approval.'
            ) : (
              'Thank you for submitting your documents. An admin is reviewing them. You will be able to accept deliveries once approved.'
            )}
          </p>

          <div
            style={{
              background: '#fff7ed',
              borderLeft: '4px solid #f59e0b',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'left',
            }}
          >
            <p style={{ fontWeight: '500', marginBottom: '10px' }}>📋 Required Documents:</p>
            <ul style={{ marginLeft: '20px', color: 'var(--text-secondary)' }}>
              <li>CIN Card Image</li>
              <li>Driver License Image</li>
              <li>Vehicle Image</li>
              <li>Complete Profile Information</li>
            </ul>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate('/courier/profile')}
            style={{ marginRight: '10px' }}
          >
            {verificationStatus === 'draft' || verificationStatus === 'rejected'
              ? 'Upload Documents'
              : 'View My Profile'}
          </button>

          <button type="button" className="btn btn-outline" onClick={() => navigate('/courier')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default VerificationPending;

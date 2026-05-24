import { useLanguage } from '../context/LanguageContext';
import React, { useState, useRef } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useCourierVerification } from '../context/CourierVerificationContext';
import { useDelivery } from '../context/DeliveryContext';

const DOC_CONFIG = [
  { key: 'cinImage', label: 'CIN Card Image' },
  { key: 'licenseImage', label: 'Driver License Image' },
  { key: 'vehicleImage', label: 'Vehicle Image' },
];

const CourierProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { addNotification, couriers, deliveries } = useDelivery();
  const {
    profile,
    documents,
    verificationStatus,
    canEditDocuments,
    allDocumentsUploaded,
    updateProfile,
    uploadDocument,
    submitForVerification,
  } = useCourierVerification();

  const myCourierInfo = (couriers || []).find(c => c.name === profile.name) || (couriers || []).find(c => c.name === 'Mike Smith') || { rating: 4.8, completedCount: 0 };
  const currentRating = myCourierInfo.rating;
  const completedCount = myCourierInfo.completedCount || (deliveries || []).filter(d => (d.courier === profile.name || d.courier === 'Mike Smith') && d.status === 'delivered').length;

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [uploadError, setUploadError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const fileInputRefs = useRef({});

  const calculateCompletion = () => {
    let completed = 0;
    const total = 7;
    if (profile.phone) completed++;
    if (profile.address) completed++;
    if (profile.vehicleType) completed++;
    if (profile.vehicleNumber) completed++;
    if (profile.cinNumber) completed++;
    if (profile.driverLicense) completed++;
    if (allDocumentsUploaded()) completed++;
    return Math.round((completed / total) * 100);
  };

  const completion = calculateCompletion();

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleDocumentClick = (docKey) => {
    if (!canEditDocuments) return;
    fileInputRefs.current[docKey]?.click();
  };

  const handleFileChange = async (docKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      await uploadDocument(docKey, file);
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    }
    e.target.value = '';
  };

  const handleSubmitVerification = () => {
    setSubmitMessage('');
    const result = submitForVerification();
    if (result.success) {
      setSubmitMessage(result.message);
      addNotification({
        type: 'courier_request',
        targetRole: 'admin',
        text: 'New Courier Verification Request',
        description: `${profile.name} submitted CIN, license, and vehicle documents for review.`,
        time: 'Just now',
        path: '/admin/courier-verification',
        details: {
          name: profile.name,
          vehicle: profile.vehicleType,
          experience: profile.vehicleNumber,
          rating: 'Pending review',
        },
      });
    } else {
      setSubmitMessage(result.message);
    }
  };

  const documentsLocked = !canEditDocuments;

  return (
    <MainLayout userRole="courier" activePage="courier-profile">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">{profile.avatar}</div>
          <h1 className="profile-name">{isEditing ? formData.name : profile.name}</h1>
          <div className="profile-role">Courier</div>
          <div className={`verification-badge ${verificationStatus}`}>
            {verificationStatus === 'approved' && '✅ Verified Account'}
            {verificationStatus === 'pending' && '⏳ Pending Admin Review'}
            {verificationStatus === 'rejected' && '❌ Verification Rejected'}
            {verificationStatus === 'draft' && '📝 Complete & Submit Documents'}
          </div>
        </div>

        {verificationStatus === 'approved' && (
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #10b981' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Your account is verified. You can accept deliveries from Available Deliveries.
            </p>
          </div>
        )}

        {verificationStatus === 'pending' && (
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #f59e0b' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Documents submitted. An admin is reviewing your files. You will get a notification when approved.
            </p>
          </div>
        )}

        {verificationStatus === 'rejected' && (
          <div className="card" style={{ marginBottom: '20px', borderLeft: '4px solid #ef4444' }}>
            <p style={{ margin: 0, color: '#ef4444' }}>
              Verification rejected. Please re-upload your documents and submit again.
            </p>
          </div>
        )}

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{profile.earnings?.toFixed(2) || '0.00'} MAD</div>
            <div className="profile-stat-label">Total Earnings</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{currentRating.toFixed(1)} ⭐</div>
            <div className="profile-stat-label">Rating</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{completedCount}</div>
            <div className="profile-stat-label">Completed Deliveries</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Profile Completion</span>
            <span>{completion}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
            {verificationStatus !== 'approved' && !isEditing && (
              <button type="button" className="btn btn-primary" onClick={handleEdit}>
                Edit Profile
              </button>
            )}
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              {isEditing ? (
                <input type="text" name="name" value={formData.name} onChange={handleChange} />
              ) : (
                <input type="text" value={profile.name} disabled />
              )}
            </div>
            <div className="profile-field">
              <label>{t('email')}</label>
              <input type="email" value={profile.email} disabled />
            </div>
            <div className="profile-field">
              <label>{t('phone')}</label>
              {isEditing ? (
                <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
              ) : (
                <input type="tel" value={profile.phone} disabled />
              )}
            </div>
            <div className="profile-field">
              <label>Address</label>
              {isEditing ? (
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" />
              ) : (
                <textarea value={profile.address} disabled rows="3" />
              )}
            </div>
            <div className="profile-field">
              <label>Vehicle Type</label>
              {isEditing ? (
                <select name="vehicleType" value={formData.vehicleType} onChange={handleChange}>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              ) : (
                <input type="text" value={profile.vehicleType} disabled />
              )}
            </div>
            <div className="profile-field">
              <label>Vehicle Number</label>
              {isEditing ? (
                <input type="text" name="vehicleNumber" value={formData.vehicleNumber} onChange={handleChange} />
              ) : (
                <input type="text" value={profile.vehicleNumber} disabled />
              )}
            </div>
            <div className="profile-field">
              <label>CIN Number</label>
              {isEditing ? (
                <input type="text" name="cinNumber" value={formData.cinNumber} onChange={handleChange} />
              ) : (
                <input type="text" value={profile.cinNumber} disabled />
              )}
            </div>
            <div className="profile-field">
              <label>Driver License Number</label>
              {isEditing ? (
                <input type="text" name="driverLicense" value={formData.driverLicense} onChange={handleChange} />
              ) : (
                <input type="text" value={profile.driverLicense} disabled />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave}>
                {t('saveChanges')}
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Required Documents</span>
            {documentsLocked && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Locked after submit</span>}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
            Upload each document once. When all 3 are ready, submit for admin verification.
          </p>

          {uploadError && (
            <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '12px' }}>{uploadError}</p>
          )}

          <div className="profile-form-grid">
            {DOC_CONFIG.map(({ key, label }) => {
              const doc = documents[key];
              return (
                <div key={key}>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    ref={(el) => { fileInputRefs.current[key] = el; }}
                    onChange={(e) => handleFileChange(key, e)}
                    disabled={documentsLocked}
                  />
                  <div
                    className="document-upload"
                    onClick={() => handleDocumentClick(key)}
                    style={{
                      cursor: documentsLocked ? 'not-allowed' : 'pointer',
                      opacity: documentsLocked && !doc ? 0.7 : 1,
                    }}
                  >
                    {doc?.dataUrl ? (
                      <img
                        src={doc.dataUrl}
                        alt={label}
                        style={{
                          width: '100%',
                          maxHeight: '100px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '8px',
                        }}
                      />
                    ) : (
                      <div className="document-icon">📄</div>
                    )}
                    <div className="document-name">{label}</div>
                    <div className="document-status">
                      {doc ? `✅ ${doc.fileName}` : '⚠️ Click to upload'}
                    </div>
                    {canEditDocuments && doc && (
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '6px' }}>
                        Click to replace
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {(verificationStatus === 'draft' || verificationStatus === 'rejected') && (
            <div className="profile-actions" style={{ marginTop: '20px', flexDirection: 'column', alignItems: 'stretch' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmitVerification}
                disabled={!allDocumentsUploaded()}
              >
                Submit Documents for Verification
              </button>
              {!allDocumentsUploaded() && (
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                  Upload all 3 documents to enable submit
                </p>
              )}
              {submitMessage && (
                <p style={{ fontSize: '13px', marginTop: '8px', textAlign: 'center', color: 'var(--primary-color)' }}>
                  {submitMessage}
                </p>
              )}
            </div>
          )}

          {verificationStatus === 'pending' && (
            <button
              type="button"
              className="btn btn-outline"
              style={{ marginTop: '16px' }}
              onClick={() => navigate('/courier/available')}
            >
              Check verification status
            </button>
          )}
        </div>

        {/* CUSTOMER REVIEWS SECTION */}
        <div className="profile-section" style={{ marginTop: '30px' }}>
          <div className="profile-section-title">
            <span>Customer Reviews & Feedback</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
            {deliveries.filter(d => (d.courier === profile.name || d.courier === 'Mike Smith') && d.ratingGiven).length > 0 ? (
              deliveries.filter(d => (d.courier === profile.name || d.courier === 'Mike Smith') && d.ratingGiven).map(d => (
                <div key={d.id} style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: 'var(--text-primary)' }}>{d.id}</span>
                    <span style={{ color: '#facc15', fontSize: '12px' }}>
                      {'★'.repeat(d.ratingGiven)}{'☆'.repeat(5 - d.ratingGiven)}
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    Rated by: <strong>{d.customer}</strong> • {d.date}
                  </p>
                  {d.ratingComment ? (
                    <p style={{ fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0 }}>
                      "{d.ratingComment}"
                    </p>
                  ) : (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                      No comment left.
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', fontStyle: 'italic' }}>
                No customer reviews received yet.
              </p>
            )}
          </div>
        </div>

      </div>
    </MainLayout>
  );
};

export default CourierProfile;

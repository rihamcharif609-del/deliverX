import { useLanguage } from '../context/LanguageContext';
import React, { useState, useRef, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useCourierVerification } from '../context/CourierVerificationContext';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';
import { 
  FaMotorcycle, 
  FaUser, 
  FaCamera, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCheck, 
  FaLock, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaIdCard, 
  FaCheckCircle, 
  FaExclamationCircle, 
  FaStar, 
  FaFileAlt, 
  FaClock, 
  FaTimesCircle, 
  FaWallet, 
  FaTruck, 
  FaBoxes 
} from 'react-icons/fa';

const DOC_CONFIG = [
  { key: 'cinImage', label: 'CIN Card Image' },
  { key: 'licenseImage', label: 'Driver License Image' },
  { key: 'vehicleImage', label: 'Vehicle Image' },
];

const CourierProfile = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    addNotification, 
    deliveries, 
    courierRatingSummary, 
    fetchCourierRatings, 
    fetchDeliveries,
    fetchCourierWallet,
    courierEarnings,
    deliveriesLoading,
    walletLoading,
    ratingsLoading,
  } = useDelivery();
  const {
    profile,
    documents,
    verificationStatus,
    verificationLoading,
    verificationError,
    completion,
    canEditDocuments,
    profileComplete,
    updateProfile,
    uploadDocument,
    submitForVerification,
  } = useCourierVerification();

  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchDeliveries('courier').catch(() => {});
    fetchCourierRatings().catch(() => {});
    fetchCourierWallet().catch(() => {});
  }, [fetchDeliveries, fetchCourierRatings, fetchCourierWallet]);

  const completedDeliveries = (deliveries || []).filter(
    d => d.status === 'delivered' && (d.courierId === user?.id || d.courier === user?.name || d.courier === 'Mike Smith')
  );
  const totalEarnings = completedDeliveries.reduce((sum, d) => sum + (d.amount - d.commission), 0) || courierEarnings.total || 0;
  const currentRating = courierRatingSummary.averageRating || 0;
  const completedCount = completedDeliveries.length;
  const customerReviews = (deliveries || []).filter(
    d => (d.courier === profile.name || d.courier === 'Mike Smith') && d.ratingGiven
  );

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [uploadError, setUploadError] = useState('');
  const [submitMessage, setSubmitMessage] = useState('');
  const fileInputRefs = useRef({});
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (!isEditing) {
      setFormData({ ...profile });
    }
  }, [isEditing, profile]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateProfile({ photo: reader.result })
        .then(() => {
          addNotification({
            type: 'status_update',
            targetRole: 'courier',
            text: 'Profile Photo Updated',
            description: 'Your profile photo was successfully updated.',
            time: 'Just now',
            path: '/courier/profile'
          });
        })
        .catch(() => {
          alert('Could not update profile photo.');
        });
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setFormData({ ...profile });
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSubmitMessage('');
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (err) {
      setSubmitMessage(err.response?.data?.message || 'Could not save profile.');
    }
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

  const handleSubmitVerification = async () => {
    setSubmitMessage('');
    const result = await submitForVerification();
    if (result.success) {
      setSubmitMessage(result.message);
      addNotification({
        type: 'courier_request',
        targetRole: 'admin',
        text: 'New Courier Verification Request',
        description: `${profile.name} completed their courier profile and submitted documents for review.`,
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

  // Circular progress ring parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completion / 100) * circumference;

  const checklistItems = [
    { label: 'Personal Contact (Name & Phone)', percentage: 20, completed: Boolean(profile.name && profile.phone) },
    { label: 'Residential Address', percentage: 15, completed: Boolean(profile.address) },
    { label: 'Vehicle Details (Type & Plate)', percentage: 20, completed: Boolean(profile.vehicleType && profile.vehicleNumber) },
    { label: 'Identity & License (CIN, Driving)', percentage: 20, completed: Boolean(profile.cinNumber && profile.driverLicense) },
    { label: 'Verification Documents (3 Files)', percentage: 25, completed: Boolean(documents.cinImage?.dataUrl && documents.licenseImage?.dataUrl && documents.vehicleImage?.dataUrl) },
  ];

  return (
    <MainLayout userRole="courier" activePage="courier-profile">
      {/* ===== HERO PAGE BANNER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaMotorcycle style={{ fontSize: '11px' }} />
            <span>COURIER PROFILE</span>
          </div>
          <h1 className="hero-banner-title">
            Courier Profile & Verification
          </h1>
          <p className="hero-banner-subtitle">
            Manage your personal credentials, vehicle details, verification documents, and client ratings.
          </p>
        </div>
      </div>

      {/* ===== STATUS ALERT BANNERS ===== */}
      {verificationStatus === 'approved' && (
        <div className="courier-status-banner approved">
          <FaCheckCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Account Verified & Active</strong>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
              Your courier account is approved! You have full access to claim and fulfill orders from Available Deliveries.
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="courier-status-banner pending">
          <FaClock size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Verification Under Admin Review</strong>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
              Your profile and identity documents have been submitted. DeliverX administrators are reviewing your submission.
            </div>
          </div>
        </div>
      )}

      {verificationStatus === 'rejected' && (
        <div className="courier-status-banner rejected">
          <FaTimesCircle size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong>Verification Rejected</strong>
            <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
              Your verification was not approved. Please review your details, re-upload clear photos of required documents, and submit again.
            </div>
          </div>
        </div>
      )}

      {/* ===== NOTIFICATION FEEDBACK BANNERS ===== */}
      {submitMessage && (
        <div className="form-submit-error-banner" style={{
          background: 'rgba(37,99,235,0.08)',
          borderColor: 'rgba(37,99,235,0.3)',
          color: '#2563eb',
          marginBottom: '20px'
        }}>
          <FaCheckCircle size={16} />
          <span>{submitMessage}</span>
        </div>
      )}

      {uploadError && (
        <div className="form-submit-error-banner" style={{
          background: 'rgba(239,68,68,0.08)',
          borderColor: 'rgba(239,68,68,0.3)',
          color: '#ef4444',
          marginBottom: '20px'
        }}>
          <FaExclamationCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ===== MAIN PROFILE LAYOUT ===== */}
      <div className="dashboard-grid grid-5" style={{ gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: AVATAR HEADER, TABS & CONTENT CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TOP AVATAR HEADER CARD */}
          <div className="form-section-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                ref={photoInputRef}
                onChange={handlePhotoUpload}
              />
              <div 
                className="profile-avatar-wrapper"
                onClick={() => photoInputRef.current?.click()}
                style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '28px',
                  flexShrink: 0
                }}
                title="Click to upload profile photo"
              >
                {profile.photo ? (
                  <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  profile.avatar || 'CR'
                )}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <FaCamera size={16} />
                  <span>UPLOAD</span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                    {isEditing ? formData.name : profile.name}
                  </h3>
                  {verificationStatus === 'approved' && (
                    <span className="courier-profile-badge approved">
                      <FaCheckCircle size={12} /> Verified Courier
                    </span>
                  )}
                  {verificationStatus === 'pending' && (
                    <span className="courier-profile-badge pending">
                      <FaClock size={12} /> Under Review
                    </span>
                  )}
                  {verificationStatus === 'rejected' && (
                    <span className="courier-profile-badge rejected">
                      <FaTimesCircle size={12} /> Verification Rejected
                    </span>
                  )}
                  {verificationStatus === 'draft' && (
                    <span className="courier-profile-badge draft">
                      <FaFileAlt size={12} /> Documents Incomplete
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 14px' }}>
                  Courier Account · Morocco
                </p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="dashboard-btn-primary btn-sm"
                    onClick={() => photoInputRef.current?.click()}
                    style={{ width: 'auto' }}
                  >
                    <FaCamera /> Upload new photo
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    At least 800×800 px recommended. JPG or PNG allowed.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INNER SUB-NAVIGATION TABS */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'profile', label: 'Personal & Vehicle Info', icon: <FaMotorcycle /> },
              { id: 'documents', label: 'Verification Documents', icon: <FaIdCard /> },
              { id: 'reviews', label: `Reviews (${customerReviews.length})`, icon: <FaStar /> },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`dashboard-btn-outline btn-sm ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#2563eb' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  borderColor: activeTab === tab.id ? '#2563eb' : 'var(--border-color)',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: '600'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PERSONAL & VEHICLE DETAILS */}
          {activeTab === 'profile' && (
            <>
              {/* PERSONAL INFORMATION CARD */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge pickup">
                    <FaUser />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Personal Information</h3>
                    <p>Name, email address and direct phone contact</p>
                  </div>
                  {verificationStatus !== 'approved' && !isEditing && (
                    <button type="button" className="dashboard-btn-outline btn-sm" onClick={handleEdit}>
                      <FaEdit /> Edit Details
                    </button>
                  )}
                  {isEditing && (
                    <button type="button" className="dashboard-btn-outline btn-sm" onClick={handleCancel}>
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>

                <div className="form-two-column-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Full Name</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="name" 
                        className="form-control" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="e.g. Karim Bennani"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">Full Name</span>
                        <span className="courier-detail-value">{profile.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">{t('email')}</label>
                    <div className="courier-detail-field" style={{ opacity: 0.85 }}>
                      <span className="courier-detail-label">{t('email')} (Locked)</span>
                      <span className="courier-detail-value">{profile.email || 'Not provided'}</span>
                    </div>
                  </div>
                </div>

                <div className="form-two-column-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">{t('phone')}</label>
                    {isEditing ? (
                      <input 
                        type="tel" 
                        name="phone" 
                        className="form-control" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        placeholder="+212 600 000000"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">{t('phone')}</span>
                        <span className="courier-detail-value">{profile.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Address</label>
                    {isEditing ? (
                      <textarea 
                        name="address" 
                        className="form-control" 
                        value={formData.address} 
                        onChange={handleChange} 
                        rows="2"
                        placeholder="Street address, City, Morocco"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">Address</span>
                        <span className="courier-detail-value">{profile.address || 'Not provided'}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* VEHICLE & LICENSING CARD */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge destination">
                    <FaTruck />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Vehicle & Licensing Information</h3>
                    <p>Registered vehicle specification, license plate, and national identification</p>
                  </div>
                </div>

                <div className="form-two-column-grid" style={{ marginBottom: '16px' }}>
                  <div className="form-field-group">
                    <label className="form-field-label">Vehicle Type</label>
                    {isEditing ? (
                      <select 
                        name="vehicleType" 
                        className="form-control" 
                        value={formData.vehicleType} 
                        onChange={handleChange}
                      >
                        <option value="">Select vehicle type</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Car">Car</option>
                        <option value="Scooter">Scooter</option>
                        <option value="Bicycle">Bicycle</option>
                      </select>
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">Vehicle Type</span>
                        <span className="courier-detail-value">{profile.vehicleType || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Vehicle Number / Plate</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="vehicleNumber" 
                        className="form-control" 
                        value={formData.vehicleNumber} 
                        onChange={handleChange} 
                        placeholder="e.g. 12345-A-6"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">Vehicle Plate Number</span>
                        <span className="courier-detail-value">{profile.vehicleNumber || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-two-column-grid">
                  <div className="form-field-group">
                    <label className="form-field-label">CIN Number (National ID)</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="cinNumber" 
                        className="form-control" 
                        value={formData.cinNumber} 
                        onChange={handleChange} 
                        placeholder="e.g. BK123456"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">CIN Number</span>
                        <span className="courier-detail-value">{profile.cinNumber || 'Not specified'}</span>
                      </div>
                    )}
                  </div>

                  <div className="form-field-group">
                    <label className="form-field-label">Driver License Number</label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        name="driverLicense" 
                        className="form-control" 
                        value={formData.driverLicense} 
                        onChange={handleChange} 
                        placeholder="e.g. DL-98765432"
                      />
                    ) : (
                      <div className="courier-detail-field">
                        <span className="courier-detail-label">Driver License</span>
                        <span className="courier-detail-value">{profile.driverLicense || 'Not specified'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* EDITING ACTION BAR */}
                {isEditing && (
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <button type="button" className="dashboard-btn-outline" onClick={handleCancel}>
                      <FaTimes /> Cancel
                    </button>
                    <button type="button" className="dashboard-btn-primary" onClick={handleSave}>
                      <FaSave /> {t('saveChanges')}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: REQUIRED VERIFICATION DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="form-section-card">
              <div className="form-card-header">
                <div className="form-card-icon-badge destination">
                  <FaIdCard />
                </div>
                <div style={{ flex: 1 }}>
                  <h3>Required Documents</h3>
                  <p>Upload each document once. When all 3 are ready, submit for admin verification.</p>
                </div>
                {documentsLocked && (
                  <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaLock /> Locked after submit
                  </span>
                )}
              </div>

              <div className="courier-doc-grid">
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
                        className={`courier-doc-card ${doc?.dataUrl ? 'uploaded' : ''} ${documentsLocked ? 'locked' : ''}`}
                        onClick={() => handleDocumentClick(key)}
                        style={{
                          cursor: documentsLocked ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {doc?.dataUrl ? (
                          <div className="courier-doc-preview-wrapper">
                            <img
                              src={doc.dataUrl}
                              alt={label}
                              className="courier-doc-preview-img"
                            />
                            <div style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              background: '#10b981',
                              color: 'white',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
                            }}>
                              <FaCheck />
                            </div>
                          </div>
                        ) : (
                          <div className="courier-doc-placeholder-icon">
                            <FaFileAlt />
                          </div>
                        )}

                        <div style={{ width: '100%', marginBottom: '12px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '12px', color: doc ? '#10b981' : '#f59e0b', fontWeight: '600' }}>
                            {doc ? `✅ ${doc.fileName}` : '⚠️ Required'}
                          </div>
                        </div>

                        {canEditDocuments && (
                          <button
                            type="button"
                            className={doc ? "dashboard-btn-outline btn-sm" : "dashboard-btn-primary btn-sm"}
                            style={{ width: '100%', fontSize: '12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDocumentClick(key);
                            }}
                          >
                            {doc ? 'Replace Document' : 'Upload Document'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* VERIFICATION SUBMISSION CONTROLS */}
              {(verificationStatus === 'draft' || verificationStatus === 'rejected') && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="dashboard-btn-primary"
                    onClick={handleSubmitVerification}
                    disabled={!profileComplete() || verificationLoading}
                    style={{ width: '100%', padding: '14px 24px', fontSize: '15px' }}
                  >
                    {verificationLoading ? (
                      <LoadingSpinner inline label="Submitting..." size={14} />
                    ) : (
                      <>
                        <FaCheckCircle /> Submit Profile for Verification
                      </>
                    )}
                  </button>
                  {!profileComplete() && (
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, textAlign: 'center' }}>
                      Fill every profile field and upload all 3 documents to reach 100%.
                    </p>
                  )}
                </div>
              )}

              {verificationStatus === 'pending' && (
                <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <button
                    type="button"
                    className="dashboard-btn-outline"
                    onClick={() => navigate('/courier/available')}
                  >
                    Check Available Deliveries
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CUSTOMER REVIEWS & FEEDBACK */}
          {activeTab === 'reviews' && (
            <div className="form-section-card">
              <div className="form-card-header">
                <div className="form-card-icon-badge schedule">
                  <FaStar />
                </div>
                <div style={{ flex: 1 }}>
                  <h3>Customer Reviews & Ratings</h3>
                  <p>Verified feedback received from clients after successful deliveries</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
                {customerReviews.length > 0 ? (
                  customerReviews.map((d) => (
                    <div 
                      key={d.id} 
                      style={{
                        padding: '18px 20px',
                        borderRadius: '14px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--hover-bg)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px', color: '#2563eb' }}>{d.id}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ color: '#facc15', fontSize: '13px', letterSpacing: '2px' }}>
                            {'★'.repeat(d.ratingGiven)}{'☆'.repeat(5 - d.ratingGiven)}
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                            {d.ratingGiven}.0
                          </span>
                        </div>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 10px 0' }}>
                        Rated by: <strong style={{ color: 'var(--text-primary)' }}>{d.customer}</strong> • {d.date || 'Recent delivery'}
                      </p>
                      {d.ratingComment ? (
                        <p style={{ fontSize: '13px', fontStyle: 'italic', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                          "{d.ratingComment}"
                        </p>
                      ) : (
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 0 }}>
                          No written comment left.
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', margin: '0 auto 16px auto' }}>
                      <FaStar />
                    </div>
                    <h4 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>No Customer Reviews Yet</h4>
                    <p style={{ fontSize: '13px', margin: 0 }}>Complete deliveries to receive customer ratings and feedback on your service.</p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: "COMPLETE YOUR PROFILE" GAUGE & COURIER PERFORMANCE */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PROFILE COMPLETION GAUGE CARD (PINTEREST INSPIRED) */}
          <div className="form-section-card" style={{ textAlign: 'center', position: 'relative' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '18px' }}>
              Complete your profile
            </h3>

            {/* CIRCULAR PROGRESS GAUGE */}
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 20px auto' }}>
              <svg width="110" height="110" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={completion === 100 ? "#10b981" : "#2563eb"}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '900',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px'
              }}>
                {completion}%
              </div>
            </div>

            {/* CHECKLIST ITEMS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              {checklistItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: item.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: item.completed ? '600' : '400'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.completed ? (
                      <FaCheck style={{ color: '#10b981', fontSize: '12px' }} />
                    ) : (
                      <FaTimes style={{ color: 'var(--border-color)', fontSize: '12px' }} />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: item.completed ? '#10b981' : 'var(--text-secondary)', fontWeight: '700' }}>
                    {item.completed ? `${item.percentage}%` : `+${item.percentage}%`}
                  </span>
                </div>
              ))}
            </div>

            {verificationError && (
              <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '14px', marginBottom: 0 }}>
                {verificationError}
              </p>
            )}
          </div>

          {/* COURIER PERFORMANCE STATS CARD */}
          <SectionLoading loading={walletLoading || ratingsLoading || deliveriesLoading} label="Loading courier stats..." minHeight="120px">
            <div className="form-section-card">
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
                Courier Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'var(--hover-bg)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      <FaWallet />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Earnings</span>
                  </div>
                  <strong style={{ fontSize: '17px', fontWeight: '800', color: '#10b981' }}>
                    {totalEarnings.toFixed(2)} MAD
                  </strong>
                </div>

                <div style={{
                  background: 'var(--hover-bg)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      <FaStar />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Rating</span>
                  </div>
                  <strong style={{ fontSize: '17px', fontWeight: '800', color: '#f59e0b' }}>
                    {currentRating > 0 ? currentRating.toFixed(1) : '0.0'} ⭐
                  </strong>
                </div>

                <div style={{
                  background: 'var(--hover-bg)',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>
                      <FaTruck />
                    </div>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Completed Deliveries</span>
                  </div>
                  <strong style={{ fontSize: '17px', fontWeight: '800', color: '#2563eb' }}>
                    {completedCount}
                  </strong>
                </div>
              </div>
            </div>
          </SectionLoading>

        </div>

      </div>
    </MainLayout>
  );
};

export default CourierProfile;


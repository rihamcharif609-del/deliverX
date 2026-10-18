import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useCourierVerification } from '../context/CourierVerificationContext';
import { useDelivery } from '../context/DeliveryContext';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';
import { 
  FaShieldAlt, 
  FaIdCard, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaFileAlt, 
  FaSearch, 
  FaTruck, 
  FaTimes, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaExclamationCircle, 
  FaUserCheck,
  FaEye
} from 'react-icons/fa';

const DOC_LABELS = {
  cinImage: 'CIN National ID Card',
  licenseImage: 'Driver License',
  vehicleImage: 'Vehicle Photo',
};

const AdminCourierVerification = ({ setUserRole }) => {
  const {
    adminVerifications,
    verificationLoading,
    verificationError,
    fetchAdminVerifications,
    approveVerification,
    rejectVerification,
  } = useCourierVerification();
  const { addNotification } = useDelivery();
  const [rejectReason, setRejectReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);
  const [selectedCourierId, setSelectedCourierId] = useState(null);

  useEffect(() => {
    fetchAdminVerifications().then((rows) => {
      setSelectedCourierId((current) => current || rows[0]?.id || null);
    }).catch(() => {});
  }, [fetchAdminVerifications]);

  const selected = adminVerifications.find((item) => item.id === selectedCourierId) || adminVerifications[0];
  const verification = selected || {};
  const profile = selected?.profile || {};
  const documents = selected?.documents || {};
  const verificationStatus = selected?.status || 'draft';

  const notifyCourier = (type, text, description) => {
    addNotification({
      type,
      targetRole: 'courier',
      targetUserId: selected?.id,
      text,
      description,
      time: 'Just now',
      path: '/courier/profile',
    });
  };

  const handleApprove = () => {
    if (!selected?.id) return;
    approveVerification(selected.id);
    notifyCourier(
      'courier_request',
      'Account Approved',
      'Your documents were verified. You can now accept deliveries.'
    );
  };

  const handleReject = () => {
    if (!selected?.id) return;
    const reason = rejectReason.trim() || 'Documents do not meet requirements.';
    rejectVerification(selected.id, reason);
    notifyCourier(
      'courier_notify_refunded',
      'Verification Rejected',
      reason
    );
    setRejectReason('');
  };

  const hasSubmission = Boolean(selected);
  const courierInitials = (profile.name || 'CR')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <MainLayout userRole="admin" activePage="courier-verification" setUserRole={setUserRole}>
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>IDENTITY & COMPLIANCE</span>
          </div>
          <h1 className="hero-banner-title">
            Courier Verification 🪪
          </h1>
          <p className="hero-banner-subtitle">
            Review uploaded CIN national ID cards, driver licenses, and vehicle credentials to approve or reject courier onboarding.
          </p>
        </div>
        <div className="hero-banner-actions">
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'rgba(37, 99, 235, 0.12)',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            borderRadius: '12px',
            color: '#2563eb',
            fontSize: '13px',
            fontWeight: '700'
          }}>
            <FaIdCard /> {adminVerifications.length} Verification Request{adminVerifications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ERROR BANNER */}
      {verificationError && (
        <div className="form-submit-error-banner" style={{ marginBottom: '24px' }}>
          <FaExclamationCircle size={16} />
          <span>{verificationError}</span>
        </div>
      )}

      {/* APPLICANT SELECTOR (IF MULTIPLE) */}
      {adminVerifications.length > 1 && (
        <div className="form-section-card" style={{ marginBottom: '24px' }}>
          <div className="admin-card-header" style={{ marginBottom: '14px' }}>
            <div className="admin-card-header-left">
              <div className="form-card-icon-badge pickup">
                <FaUserCheck />
              </div>
              <div>
                <h3 className="admin-card-title">Select Courier Applicant</h3>
                <p className="admin-card-subtitle">Choose an applicant submission to review and decide</p>
              </div>
            </div>
          </div>
          <select
            className="admin-table-select"
            style={{ width: '100%', padding: '12px 16px', fontSize: '14px' }}
            value={selected?.id || ''}
            onChange={(e) => setSelectedCourierId(Number(e.target.value))}
          >
            {adminVerifications.map((item) => (
              <option key={item.id} value={item.id}>
                {item.profile.name} — Status: {item.status.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      )}

      {verificationLoading && !selected ? (
        <LoadingSpinner centered label="Loading courier requests..." minHeight="240px" />
      ) : selected && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* APPLICANT SUMMARY HEADER CARD */}
          <div className="form-section-card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                  boxShadow: '0 6px 18px rgba(37, 99, 235, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '22px',
                  flexShrink: 0
                }}>
                  {profile.photo ? (
                    <img src={profile.photo} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    courierInitials
                  )}
                </div>

                <div>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                    {profile.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', flexWrap: 'wrap', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaEnvelope size={12} color="#2563eb" /> {profile.email}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FaPhoneAlt size={12} color="#10b981" /> {profile.phone || 'No phone provided'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {verificationStatus === 'draft' && (
                  <span className="courier-profile-badge draft">
                    <FaFileAlt size={12} /> Not Submitted
                  </span>
                )}
                {verificationStatus === 'pending' && (
                  <span className="courier-profile-badge pending">
                    <FaClock size={12} /> Under Admin Review
                  </span>
                )}
                {verificationStatus === 'approved' && (
                  <span className="courier-profile-badge approved">
                    <FaCheckCircle size={12} /> Verified & Active
                  </span>
                )}
                {verificationStatus === 'rejected' && (
                  <span className="courier-profile-badge rejected">
                    <FaTimesCircle size={12} /> Verification Rejected
                  </span>
                )}
              </div>
            </div>

            {verification.submittedAt && (
              <div style={{
                marginTop: '16px',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-color)',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaClock size={12} />
                <span>Submitted for review: <strong>{new Date(verification.submittedAt).toLocaleString()}</strong></span>
              </div>
            )}

            {verification.rejectionReason && verificationStatus === 'rejected' && (
              <div style={{
                marginTop: '14px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#ef4444',
                fontSize: '13px'
              }}>
                <strong>Rejection Reason:</strong> {verification.rejectionReason}
              </div>
            )}
          </div>

          {!hasSubmission ? (
            <div className="form-section-card" style={{ textAlign: 'center', padding: '54px 20px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.08)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '26px',
                margin: '0 auto 16px auto'
              }}>
                <FaIdCard />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
                No Active Submission
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>
                This courier has not completed their profile or uploaded documents yet.
              </p>
            </div>
          ) : (
            <>
              {/* PROFILE & VEHICLE CREDENTIALS */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge destination">
                    <FaTruck />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Vehicle & Licensing Credentials</h3>
                    <p>Submitted vehicle model, license plate, national ID, and residential address</p>
                  </div>
                </div>

                <div className="form-two-column-grid" style={{ marginBottom: '16px' }}>
                  <div className="courier-detail-field">
                    <span className="courier-detail-label">Vehicle Model & Plate</span>
                    <span className="courier-detail-value">
                      {profile.vehicleType ? `${profile.vehicleType} — ${profile.vehicleNumber}` : 'Not provided'}
                    </span>
                  </div>

                  <div className="courier-detail-field">
                    <span className="courier-detail-label">CIN National ID</span>
                    <span className="courier-detail-value">{profile.cinNumber || 'Not provided'}</span>
                  </div>
                </div>

                <div className="form-two-column-grid">
                  <div className="courier-detail-field">
                    <span className="courier-detail-label">Driver License Number</span>
                    <span className="courier-detail-value">{profile.driverLicense || 'Not provided'}</span>
                  </div>

                  <div className="courier-detail-field">
                    <span className="courier-detail-label">Registered Address</span>
                    <span className="courier-detail-value">{profile.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* UPLOADED DOCUMENTS */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge pickup">
                    <FaIdCard />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Uploaded Verification Documents</h3>
                    <p>Click on any document or preview button to inspect full-resolution images</p>
                  </div>
                </div>

                <div className="courier-doc-grid">
                  {Object.entries(DOC_LABELS).map(([key, label]) => {
                    const doc = documents[key];
                    return (
                      <div
                        key={key}
                        className={`courier-doc-card ${doc?.dataUrl ? 'uploaded' : ''}`}
                        style={{ cursor: doc ? 'pointer' : 'default' }}
                        onClick={() => {
                          if (doc?.dataUrl) {
                            setPreviewDoc({ label, dataUrl: doc.dataUrl });
                          }
                        }}
                      >
                        {doc?.dataUrl ? (
                          <>
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
                                <FaCheckCircle />
                              </div>
                            </div>
                            <div style={{ width: '100%', marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {label}
                              </div>
                              <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                                ✅ {doc.fileName}
                              </div>
                            </div>
                            <button
                              type="button"
                              className="dashboard-btn-outline btn-sm"
                              style={{ width: '100%', fontSize: '12px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDoc({ label, dataUrl: doc.dataUrl });
                              }}
                            >
                              <FaEye /> View Full Size
                            </button>
                          </>
                        ) : (
                          <>
                            <div className="courier-doc-placeholder-icon">
                              <FaFileAlt />
                            </div>
                            <div style={{ width: '100%', marginBottom: '12px' }}>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>
                                {label}
                              </div>
                              <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                                ⚠️ Missing Document
                              </div>
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                              Not yet provided
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ADMIN DECISION & ACCESS CONTROL */}
              {verificationStatus === 'pending' && (
                <div className="form-section-card">
                  <div className="form-card-header">
                    <div className="form-card-icon-badge schedule">
                      <FaCheckCircle />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3>Admin Decision & Access Control</h3>
                      <p>Authorize this courier to accept live deliveries or reject with an explanation</p>
                    </div>
                  </div>

                  <div className="form-field-group" style={{ marginBottom: '20px' }}>
                    <label className="form-field-label">Rejection Reason (Optional if rejecting)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="e.g. Driver license image is blurry or expired. Please upload clear front & back copies."
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <button 
                      type="button"
                      className="dashboard-btn-outline" 
                      style={{ color: '#ef4444', borderColor: '#ef4444' }} 
                      onClick={handleReject}
                    >
                      <FaTimesCircle /> Reject Submission
                    </button>
                    <button
                      type="button"
                      className="dashboard-btn-primary"
                      style={{ background: '#10b981', borderColor: '#10b981' }}
                      onClick={handleApprove}
                      disabled={!documents.cinImage || !documents.licenseImage || !documents.vehicleImage}
                    >
                      <FaCheckCircle /> Approve & Grant Access
                    </button>
                  </div>
                </div>
              )}

              {verificationStatus === 'approved' && (
                <div className="courier-status-banner approved">
                  <FaCheckCircle size={22} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Courier Verified & Authorized</strong>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                      This courier has passed administrative verification and has full authorization to claim available deliveries.
                    </div>
                  </div>
                </div>
              )}

              {verificationStatus === 'rejected' && (
                <div className="courier-status-banner rejected">
                  <FaTimesCircle size={22} style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Verification Submission Rejected</strong>
                    <div style={{ fontSize: '13px', opacity: 0.9, marginTop: '2px' }}>
                      This courier's submission was rejected. The courier has been instructed to upload updated credentials.
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      )}

      {/* FULL RESOLUTION LIGHTBOX MODAL */}
      {previewDoc && (
        <div
          className="courier-modal-backdrop"
          onClick={() => setPreviewDoc(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="courier-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '820px' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div className="form-card-icon-badge pickup" style={{ width: '36px', height: '36px', fontSize: '16px' }}>
                  <FaIdCard />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  {previewDoc.label}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '4px'
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <img
              src={previewDoc.dataUrl}
              alt={previewDoc.label}
              className="verification-lightbox-img"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="dashboard-btn-primary" 
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminCourierVerification;


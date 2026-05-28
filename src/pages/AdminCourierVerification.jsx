import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useCourierVerification } from '../context/CourierVerificationContext';
import { useDelivery } from '../context/DeliveryContext';

const DOC_LABELS = {
  cinImage: 'CIN Card',
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

  React.useEffect(() => {
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

  return (
    <MainLayout userRole="admin" activePage="courier-verification" setUserRole={setUserRole}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Courier Verification</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review uploaded documents and grant access to accept deliveries.
        </p>
      </div>

      {verificationError && (
        <div className="card" style={{ marginBottom: '16px', borderLeft: '4px solid #ef4444' }}>
          <p style={{ margin: 0, color: '#ef4444' }}>{verificationError}</p>
        </div>
      )}

      {adminVerifications.length > 1 && (
        <div className="card" style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '13px' }}>
            Courier request
          </label>
          <select
            className="form-control"
            value={selected?.id || ''}
            onChange={(e) => setSelectedCourierId(Number(e.target.value))}
          >
            {adminVerifications.map((item) => (
              <option key={item.id} value={item.id}>
                {item.profile.name} - {item.status}
              </option>
            ))}
          </select>
        </div>
      )}

      {verificationLoading && !selected ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>Loading courier requests...</p>
        </div>
      ) : selected && (
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: '0 0 8px' }}>{profile.name}</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>{profile.email}</p>
            <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>{profile.phone}</p>
          </div>
          <span className={`verification-badge ${verificationStatus}`}>
            {verificationStatus === 'draft' && '📝 Not submitted'}
            {verificationStatus === 'pending' && '⏳ Pending review'}
            {verificationStatus === 'approved' && '✅ Approved'}
            {verificationStatus === 'rejected' && '❌ Rejected'}
          </span>
        </div>

        {verification.submittedAt && (
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            Submitted: {new Date(verification.submittedAt).toLocaleString()}
          </p>
        )}
        {verification.rejectionReason && verificationStatus === 'rejected' && (
          <p style={{ marginTop: '8px', fontSize: '13px', color: '#ef4444' }}>
            Rejection reason: {verification.rejectionReason}
          </p>
        )}
      </div>
      )}

      {!hasSubmission ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            The courier has not submitted documents yet.
          </p>
        </div>
      ) : (
        <>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Profile & Vehicle</h3>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Vehicle</label>
                <input type="text" value={`${profile.vehicleType} — ${profile.vehicleNumber}`} disabled />
              </div>
              <div className="profile-field">
                <label>CIN Number</label>
                <input type="text" value={profile.cinNumber} disabled />
              </div>
              <div className="profile-field">
                <label>Driver License</label>
                <input type="text" value={profile.driverLicense} disabled />
              </div>
              <div className="profile-field">
                <label>Address</label>
                <input type="text" value={profile.address} disabled />
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Uploaded Documents</h3>
            <div className="profile-form-grid">
              {Object.entries(DOC_LABELS).map(([key, label]) => {
                const doc = documents[key];
                return (
                  <div key={key} className="document-upload" style={{ cursor: doc ? 'pointer' : 'default' }}>
                    {doc?.dataUrl ? (
                      <>
                        <img
                          src={doc.dataUrl}
                          alt={label}
                          style={{
                            width: '100%',
                            maxHeight: '140px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            marginBottom: '8px',
                          }}
                          onClick={() => setPreviewDoc({ label, dataUrl: doc.dataUrl })}
                        />
                        <div className="document-name">{label}</div>
                        <div className="document-status">✅ {doc.fileName}</div>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ marginTop: '8px', padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setPreviewDoc({ label, dataUrl: doc.dataUrl })}
                        >
                          View full size
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="document-icon">📄</div>
                        <div className="document-name">{label}</div>
                        <div className="document-status">⚠️ Missing</div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {verificationStatus === 'pending' && (
            <div className="card">
              <h3 style={{ marginBottom: '12px' }}>Admin Decision</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
                If documents look correct, approve to unlock Available Deliveries for this courier.
              </p>
              <div className="form-group">
                <label>Rejection reason (optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. CIN image is blurry, please re-upload"
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={handleReject}>
                  Reject
                </button>
                <button
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981' }}
                  onClick={handleApprove}
                  disabled={!documents.cinImage || !documents.licenseImage || !documents.vehicleImage}
                >
                  Approve & Grant Access
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'approved' && (
            <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                This courier is verified and can accept deliveries.
              </p>
            </div>
          )}
        </>
      )}

      {previewDoc && (
        <div
          className="notification-modal-backdrop"
          onClick={() => setPreviewDoc(null)}
          style={{ zIndex: 10000 }}
        >
          <div
            className="notification-modal"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }}
          >
            <h3 style={{ marginBottom: '16px' }}>{previewDoc.label}</h3>
            <img
              src={previewDoc.dataUrl}
              alt={previewDoc.label}
              style={{ width: '100%', borderRadius: '8px', marginBottom: '16px' }}
            />
            <button type="button" className="btn btn-primary" onClick={() => setPreviewDoc(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AdminCourierVerification;

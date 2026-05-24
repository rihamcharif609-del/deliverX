import React, { useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useCourierVerification } from '../context/CourierVerificationContext';
import { useDelivery } from '../context/DeliveryContext';

const DOC_LABELS = {
  cinImage: 'CIN Card',
  licenseImage: 'Driver License',
  vehicleImage: 'Vehicle Photo',
};

const MOCK_SENDERS = {
  1: {
    id: 1,
    type: 'sender',
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+212 612 111 111',
    role: 'sender',
    status: 'active',
    totalDeliveries: 45,
    totalSpent: 1280.5,
    joinedDate: '2024-01-15',
  },
  4: {
    id: 4,
    type: 'sender',
    name: 'Emily Davis',
    email: 'emily.d@example.com',
    phone: '+212 612 222 222',
    role: 'sender',
    status: 'inactive',
    totalDeliveries: 12,
    totalSpent: 340.0,
    joinedDate: '2024-01-20',
  },
  6: {
    id: 6,
    type: 'sender',
    name: 'Lisa Anderson',
    email: 'lisa.a@example.com',
    phone: '+212 612 333 333',
    role: 'sender',
    status: 'inactive',
    totalDeliveries: 3,
    totalSpent: 95.0,
    joinedDate: '2024-03-01',
  },
  8: {
    id: 8,
    type: 'sender',
    name: 'Maria Garcia',
    email: 'maria.g@example.com',
    phone: '+212 612 444 444',
    role: 'sender',
    status: 'inactive',
    totalDeliveries: 8,
    totalSpent: 210.0,
    joinedDate: '2023-12-12',
  },
};

const MOCK_OTHERS = {
  3: {
    id: 3,
    type: 'admin',
    name: 'Michael Brown',
    email: 'michael.b@example.com',
    phone: '—',
    role: 'admin',
    status: 'active',
    joinedDate: '2023-11-10',
  },
};

const UserProfile = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const userFromList = location.state?.user;

  const {
    verification,
    profile,
    documents,
    verificationStatus,
    approveVerification,
    rejectVerification,
  } = useCourierVerification();
  const { deliveries, courierEarnings, addNotification } = useDelivery();

  const [rejectReason, setRejectReason] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const isLiveCourier =
    userFromList?.isLiveCourier || id === 'courier-live' || userFromList?.role === 'courier';

  const courierStats = useMemo(() => {
    const assigned = deliveries.filter(
      (d) => d.courier === profile.name || d.courier === 'Mike Smith'
    );
    const completed = assigned.filter((d) => d.status === 'delivered').length;
    return {
      assigned: assigned.length,
      completed,
      earnings: courierEarnings?.total ?? profile.earnings ?? 0,
      rating: profile.rating ?? 4.8,
    };
  }, [deliveries, profile, courierEarnings]);

  const notifyCourier = (type, text, description) => {
    addNotification({
      type,
      targetRole: 'courier',
      text,
      description,
      time: 'Just now',
      path: '/courier/profile',
    });
  };

  const handleApprove = () => {
    approveVerification();
    notifyCourier(
      'courier_request',
      'Account Approved',
      'Your documents were verified. You can now accept deliveries.'
    );
  };

  const handleReject = () => {
    const reason = rejectReason.trim() || 'Documents do not meet requirements.';
    rejectVerification(reason);
    notifyCourier('courier_notify_refunded', 'Verification Rejected', reason);
    setRejectReason('');
  };

  if (isLiveCourier) {
    const hasDocuments =
      documents.cinImage?.dataUrl &&
      documents.licenseImage?.dataUrl &&
      documents.vehicleImage?.dataUrl;

    return (
      <MainLayout userRole="admin" activePage="user-profile">
        <div className="profile-container">
          <div style={{ marginBottom: '16px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/admin/users')}
            >
              ← Back to Users
            </button>
          </div>

          <div className="profile-header">
            <div className="profile-avatar-large">{profile.avatar || 'MC'}</div>
            <h1 className="profile-name">{profile.name}</h1>
            <div className="profile-role">Courier</div>
            <div className={`verification-badge ${verificationStatus}`}>
              {verificationStatus === 'approved' && '✅ Verified'}
              {verificationStatus === 'pending' && '⏳ Pending Review'}
              {verificationStatus === 'rejected' && '❌ Rejected'}
              {verificationStatus === 'draft' && '📝 Documents Not Submitted'}
            </div>
          </div>

          <div className="profile-stats-grid">
            <div className="profile-stat-card">
              <div className="profile-stat-value">{courierStats.completed}</div>
              <div className="profile-stat-label">Completed Deliveries</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{courierStats.assigned}</div>
              <div className="profile-stat-label">Assigned Orders</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{courierStats.rating} ⭐</div>
              <div className="profile-stat-label">Rating</div>
            </div>
            <div className="profile-stat-card">
              <div className="profile-stat-value">{courierStats.earnings.toFixed(2)} MAD</div>
              <div className="profile-stat-label">Total Earnings</div>
            </div>
          </div>

          {verification.submittedAt && (
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Documents submitted: {new Date(verification.submittedAt).toLocaleString()}
              {verification.reviewedAt &&
                ` · Reviewed: ${new Date(verification.reviewedAt).toLocaleString()}`}
            </p>
          )}
          {verification.rejectionReason && verificationStatus === 'rejected' && (
            <div
              className="card"
              style={{ marginBottom: '20px', borderLeft: '4px solid #ef4444', padding: '16px' }}
            >
              <strong style={{ color: '#ef4444' }}>Rejection reason:</strong>{' '}
              {verification.rejectionReason}
            </div>
          )}

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Personal Information</span>
            </div>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input type="text" value={profile.name} disabled />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={profile.email} disabled />
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <input type="tel" value={profile.phone} disabled />
              </div>
              <div className="profile-field">
                <label>Address</label>
                <input type="text" value={profile.address} disabled />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Vehicle & Identity</span>
            </div>
            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Vehicle Type</label>
                <input type="text" value={profile.vehicleType} disabled />
              </div>
              <div className="profile-field">
                <label>Vehicle Number</label>
                <input type="text" value={profile.vehicleNumber} disabled />
              </div>
              <div className="profile-field">
                <label>CIN Number</label>
                <input type="text" value={profile.cinNumber} disabled />
              </div>
              <div className="profile-field">
                <label>Driver License</label>
                <input type="text" value={profile.driverLicense} disabled />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Required Documents</span>
            </div>

            {!hasDocuments ? (
              <p style={{ color: 'var(--text-secondary)' }}>
                No documents uploaded yet. Courier must submit from their profile.
              </p>
            ) : (
              <div className="profile-form-grid">
                {Object.entries(DOC_LABELS).map(([key, label]) => {
                  const doc = documents[key];
                  return (
                    <div key={key} className="document-upload">
                      {doc?.dataUrl ? (
                        <>
                          <img
                            src={doc.dataUrl}
                            alt={label}
                            style={{
                              width: '100%',
                              maxHeight: '120px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              marginBottom: '8px',
                              cursor: 'pointer',
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
            )}
          </div>

          {verificationStatus === 'pending' && hasDocuments && (
            <div className="profile-section card">
              <h3 style={{ marginBottom: '12px' }}>Admin decision</h3>
              <div className="form-group">
                <label>Rejection reason (optional)</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. CIN image is unclear"
                />
              </div>
              <div className="profile-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ color: '#ef4444', borderColor: '#ef4444' }}
                  onClick={handleReject}
                >
                  Reject Courier
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ backgroundColor: '#10b981' }}
                  onClick={handleApprove}
                >
                  Approve & Grant Access
                </button>
              </div>
            </div>
          )}

          {verificationStatus === 'approved' && (
            <div className="card" style={{ borderLeft: '4px solid #10b981', padding: '16px' }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                This courier is verified and can accept deliveries.
              </p>
            </div>
          )}

          <div className="profile-actions" style={{ marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/admin/courier-verification')}
            >
              Open verification page
            </button>
          </div>
        </div>

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
  }

  const userData =
    MOCK_SENDERS[id] ||
    MOCK_OTHERS[id] ||
    (userFromList?.role === 'sender'
      ? {
          type: 'sender',
          name: userFromList.name,
          email: userFromList.email,
          phone: '—',
          status: userFromList.status,
          totalDeliveries: userFromList.deliveries ?? 0,
          totalSpent: 0,
          joinedDate: userFromList.joined,
        }
      : null);

  if (!userData) {
    return (
      <MainLayout userRole="admin" activePage="user-profile">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p>User not found.</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </button>
        </div>
      </MainLayout>
    );
  }

  if (userData.type === 'admin') {
    return (
      <MainLayout userRole="admin" activePage="user-profile">
        <div className="profile-container">
          <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/users')}>
            ← Back to Users
          </button>
          <div className="profile-header" style={{ marginTop: '20px' }}>
            <div className="profile-avatar-large">
              {userData.name.split(' ').map((n) => n[0]).join('')}
            </div>
            <h1 className="profile-name">{userData.name}</h1>
            <div className="profile-role">Administrator</div>
          </div>
          <div className="profile-section">
            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={userData.email} disabled />
              </div>
              <div className="profile-field">
                <label>Joined</label>
                <input type="text" value={userData.joinedDate} disabled />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout userRole="admin" activePage="user-profile">
      <div className="profile-container">
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </button>

        <div className="profile-header" style={{ marginTop: '20px' }}>
          <div className="profile-avatar-large">
            {userData.name.split(' ').map((n) => n[0]).join('')}
          </div>
          <h1 className="profile-name">{userData.name}</h1>
          <div className="profile-role">Sender</div>
          <span className={`verification-badge ${userData.status === 'active' ? 'approved' : 'pending'}`}>
            {userData.status === 'active' ? '✅ Active' : '⏸ Inactive'}
          </span>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{userData.totalDeliveries}</div>
            <div className="profile-stat-label">Total Deliveries</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{userData.totalSpent.toFixed(2)} MAD</div>
            <div className="profile-stat-label">Total Spent</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
          </div>
          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input type="text" value={userData.name} disabled />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={userData.email} disabled />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input type="tel" value={userData.phone} disabled />
            </div>
            <div className="profile-field">
              <label>Joined Date</label>
              <input type="text" value={userData.joinedDate} disabled />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;

import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const formatDate = (value) => {
  if (!value) return 'Not provided';
  return new Date(value).toLocaleDateString();
};

const initialsFor = (name = 'User') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

const Field = ({ label, value }) => (
  <div className="profile-field">
    <label>{label}</label>
    <input type="text" value={value || 'Not provided'} disabled />
  </div>
);

const Stat = ({ label, value }) => (
  <div className="profile-stat-card">
    <div className="profile-stat-value">{value}</div>
    <div className="profile-stat-label">{label}</div>
  </div>
);

const documentsFor = (profile) => [
  { label: 'CIN Card', doc: profile?.cin_image },
  { label: 'Driver License', doc: profile?.license_image },
  { label: 'Vehicle Photo', doc: profile?.vehicle_image },
];

const UserProfile = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userFromList = location.state?.user;

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({});
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      setError('');

      try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/users/${id}`);
        setProfile(data.data?.user || null);
        setStats(data.data?.stats || {});
        setRecentDeliveries(Array.isArray(data.data?.recent_deliveries) ? data.data.recent_deliveries : []);
        setReviews(Array.isArray(data.data?.reviews) ? data.data.reviews : []);
      } catch (err) {
        if (userFromList) {
          setProfile({
            ...userFromList,
            created_at: userFromList.joined,
            profile_photo: userFromList.profile_photo || null,
          });
          setStats({
            total_deliveries: userFromList.deliveries || 0,
            completed_deliveries: 0,
            reviews_count: 0,
            average_rating: 0,
            total_spent: 0,
            total_earned: 0,
          });
          setReviews([]);
          setError(err.response?.data?.message || 'Could not refresh user details. Showing list data.');
        } else {
          setError(err.response?.data?.message || 'Could not load this user profile.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [id, userFromList]);

  const roleLabel = useMemo(() => {
    const role = profile?.role_label || profile?.role || 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  }, [profile]);

  if (isLoading) {
    return (
      <MainLayout userRole="admin" activePage="/admin/users">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          Loading user profile...
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout userRole="admin" activePage="/admin/users">
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <p style={{ marginBottom: '16px', color: '#ef4444' }}>{error || 'User not found.'}</p>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/admin/users')}>
            Back to Users
          </button>
        </div>
      </MainLayout>
    );
  }

  const isCourier = profile.role === 'courier';
  const isSender = profile.role === 'sender';

  return (
    <MainLayout userRole="admin" activePage="/admin/users">
      <div className="profile-container">
        <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/users')}>
          Back to Users
        </button>

        {error && (
          <div className="card" style={{ marginTop: '16px', padding: '14px', color: '#b45309', borderLeft: '4px solid #f59e0b' }}>
            {error}
          </div>
        )}

        <div className="profile-header" style={{ marginTop: '20px' }}>
          <div className="profile-avatar-large" style={{ overflow: 'hidden' }}>
            {profile.profile_photo ? (
              <img
                src={profile.profile_photo}
                alt={profile.name}
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              initialsFor(profile.name)
            )}
          </div>
          <h1 className="profile-name">{profile.name}</h1>
          <div className="profile-role">{roleLabel}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '12px' }}>
            <StatusBadge status={profile.status || 'inactive'} />
            {isCourier && (
              <span className={`verification-badge ${profile.verification_status === 'approved' ? 'approved' : 'pending'}`}>
                Verification: {profile.verification_status || 'draft'}
              </span>
            )}
          </div>
        </div>

        <div className="profile-stats-grid">
          <Stat label="Total Deliveries" value={stats.total_deliveries || 0} />
          <Stat label="Completed Deliveries" value={stats.completed_deliveries || 0} />
          {isSender && <Stat label="Total Spent" value={`${Number(stats.total_spent || 0).toFixed(2)} MAD`} />}
          {isSender && <Stat label="Ratings Given" value={stats.ratings_given || 0} />}
          {isCourier && <Stat label="Average Rating" value={`${Number(stats.average_rating || 0).toFixed(1)} / 5`} />}
          {isCourier && <Stat label="Reviews Count" value={stats.reviews_count || 0} />}
          {isCourier && <Stat label="Released Earnings" value={`${Number(stats.total_earned || 0).toFixed(2)} MAD`} />}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
          </div>
          <div className="profile-form-grid">
            <Field label="Full Name" value={profile.name} />
            <Field label="Email" value={profile.email} />
            <Field label="Phone" value={profile.phone} />
            <Field label="Address" value={profile.address} />
            <Field label="Role" value={roleLabel} />
            <Field label="Account Status" value={profile.status} />
            <Field label="Joined Date" value={formatDate(profile.created_at || profile.joined)} />
            <Field label="Email Verified" value={profile.email_verified_at ? formatDate(profile.email_verified_at) : 'No'} />
          </div>
        </div>

        {isCourier && (
          <div className="profile-section">
            <div className="profile-section-title">
              <span>Courier Information</span>
            </div>
            <div className="profile-form-grid">
              <Field label="Vehicle Type" value={profile.vehicle_type} />
              <Field label="Vehicle Number" value={profile.vehicle_number} />
              <Field label="CIN Number" value={profile.cin_number} />
              <Field label="Driver License" value={profile.driver_license} />
              <Field label="Verification Status" value={profile.verification_status || 'draft'} />
              <Field label="Submitted At" value={formatDate(profile.verification_submitted_at)} />
              <Field label="Reviewed At" value={formatDate(profile.verification_reviewed_at)} />
              <Field label="Rejection Reason" value={profile.verification_rejection_reason} />
            </div>
          </div>
        )}

        {isCourier && (
          <div className="profile-section">
            <div className="profile-section-title">
              <span>Courier Documents</span>
            </div>
            <div className="profile-form-grid">
              {documentsFor(profile).map(({ label, doc }) => (
                <div key={label} className="document-upload">
                  {doc?.dataUrl ? (
                    <>
                      <img
                        src={doc.dataUrl}
                        alt={label}
                        style={{
                          width: '100%',
                          maxHeight: '150px',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          cursor: 'pointer'
                        }}
                        onClick={() => setPreviewDoc({ label, dataUrl: doc.dataUrl })}
                      />
                      <div className="document-name">{label}</div>
                      <div className="document-status">{doc.fileName || 'Uploaded document'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Uploaded: {formatDate(doc.uploadedAt)}
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ marginTop: '10px', padding: '6px 12px', fontSize: '12px' }}
                        onClick={() => setPreviewDoc({ label, dataUrl: doc.dataUrl })}
                      >
                        View Document
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="document-icon">DOC</div>
                      <div className="document-name">{label}</div>
                      <div className="document-status">Missing</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="profile-section">
          <div className="profile-section-title">
            <span>{isCourier ? 'Reviews & Ratings' : 'Ratings Given'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {reviews.length > 0 ? (
              reviews.map((review) => (
                <div
                  key={review.id}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--hover-bg)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                    <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                      {isCourier ? review.sender_name || 'Sender' : review.courier_name || 'Courier'}
                    </strong>
                    <span style={{ color: '#facc15', fontSize: '12px', flexShrink: 0 }}>
                      {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 8px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    {review.delivery_code || `DEL-${review.delivery_id}`} - {formatDate(review.created_at)}
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: 'var(--text-primary)' }}>
                    "{review.comment || 'No comment left.'}"
                  </p>
                </div>
              ))
            ) : (
              <p style={{ gridColumn: '1 / -1', color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                No reviews or ratings found for this user.
              </p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Recent Deliveries</span>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tracking</th>
                  <th>Sender</th>
                  <th>Courier</th>
                  <th>Status</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentDeliveries.length > 0 ? (
                  recentDeliveries.map((delivery) => (
                    <tr key={delivery.id}>
                      <td>{delivery.tracking_code || `DEL-${delivery.id}`}</td>
                      <td>{delivery.sender?.name || 'N/A'}</td>
                      <td>{delivery.courier?.name || 'Unassigned'}</td>
                      <td><StatusBadge status={delivery.status} /></td>
                      <td>{Number(delivery.amount || 0).toFixed(2)} MAD</td>
                      <td>{formatDate(delivery.created_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                      No recent deliveries for this user.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
      </div>
    </MainLayout>
  );
};

export default UserProfile;

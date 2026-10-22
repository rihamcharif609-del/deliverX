import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import StatusBadge from '../components/StatusBadge';
import SuspendUserModal from '../components/SuspendUserModal';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaMotorcycle,
  FaTruck,
  FaBoxes,
  FaShieldAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaStar,
  FaWallet,
  FaIdCard,
  FaFileAlt,
  FaEye,
  FaTimes,
  FaExclamationCircle,
  FaBan,
  FaSpinner
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const formatDate = (value) => {
  if (!value) return 'Not provided';
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return String(value);
  }
};

const initialsFor = (name = 'User') =>
  name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

const Field = ({ label, value, icon }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{
      fontSize: '11px',
      fontWeight: '700',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }}>
      {icon && <span style={{ color: 'var(--primary-color)' }}>{icon}</span>}
      {label}
    </label>
    <div style={{
      padding: '11px 14px',
      borderRadius: '10px',
      backgroundColor: 'var(--hover-bg, #f8fafc)',
      border: '1px solid var(--border-color, #e2e8f0)',
      color: value ? 'var(--text-primary, #0f172a)' : 'var(--text-secondary, #94a3b8)',
      fontSize: '13px',
      fontWeight: '500',
      minHeight: '42px',
      display: 'flex',
      alignItems: 'center',
      wordBreak: 'break-word'
    }}>
      {value || <span style={{ fontStyle: 'italic', opacity: 0.6 }}>Not provided</span>}
    </div>
  </div>
);

const Stat = ({ label, value, icon, color = '#2563eb' }) => (
  <div
    className="profile-stat-card"
    style={{
      background: 'var(--card-background)',
      border: '1px solid var(--border-color)',
      borderRadius: '14px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: 'var(--shadow-sm)',
      transition: 'all 0.25s ease'
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{
        fontSize: '13px',
        fontWeight: '600',
        color: 'var(--text-secondary)'
      }}>
        {label}
      </span>
      {icon && (
        <span style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          backgroundColor: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}>
          {icon}
        </span>
      )}
    </div>
    <div style={{
      fontSize: '26px',
      fontWeight: '800',
      color: 'var(--text-primary)',
      letterSpacing: '-0.5px'
    }}>
      {value}
    </div>
  </div>
);

const documentsFor = (profile) => [
  { label: 'CIN Card', doc: profile?.cin_image },
  { label: 'Driver License', doc: profile?.license_image },
  { label: 'Vehicle Photo', doc: profile?.vehicle_image },
];

const getDocData = (doc) => {
  if (!doc) return null;
  if (typeof doc === 'string') {
    return { dataUrl: doc, fileName: 'Uploaded file', uploadedAt: null };
  }
  return {
    dataUrl: doc.dataUrl || doc.url || null,
    fileName: doc.fileName || doc.filename || 'Uploaded document',
    uploadedAt: doc.uploadedAt || null,
  };
};

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

  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState('');
  const [feedback, setFeedback] = useState(null);

  const handleConfirmSuspend = async ({ duration, reason }) => {
    setSuspendLoading(true);
    setSuspendError('');
    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/users/${id}/suspend`, {
        duration,
        reason,
      });
      setProfile(data.data);
      setFeedback({ type: 'success', text: data.message || 'User account has been suspended.' });
      setIsSuspendModalOpen(false);
    } catch (err) {
      setSuspendError(err.response?.data?.message || 'Failed to suspend account.');
    } finally {
      setSuspendLoading(false);
    }
  };

  const handleConfirmUnsuspend = async () => {
    setUnsuspendLoading(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/users/${id}/unsuspend`);
      setProfile(data.data);
      setFeedback({ type: 'success', text: data.message || 'User account suspension lifted.' });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to lift suspension.');
    } finally {
      setUnsuspendLoading(false);
    }
  };

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
          setError(err.response?.data?.message || 'Could not refresh user details. Showing cached list data.');
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
      <MainLayout userRole="admin" activePage="users">
        <LoadingSpinner centered label="Loading user profile details..." minHeight="360px" />
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout userRole="admin" activePage="users">
        <div className="form-section-card" style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '600px', margin: '40px auto' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            margin: '0 auto 16px auto'
          }}>
            <FaExclamationCircle />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '8px' }}>
            User Not Found
          </h2>
          <p style={{ marginBottom: '24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {error || 'The requested user could not be located in the platform database.'}
          </p>
          <button type="button" className="dashboard-btn-primary" onClick={() => navigate('/admin/users')}>
            <FaArrowLeft size={13} style={{ marginRight: '8px' }} /> Back to User Directory
          </button>
        </div>
      </MainLayout>
    );
  }

  const isCourier = profile.role === 'courier';
  const isSender = profile.role === 'sender';
  const isAdmin = profile.role === 'admin';

  const roleBadgeStyle = {
    sender: { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.25)' },
    courier: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' },
    admin: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)' }
  }[profile.role] || { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.25)' };

  const verificationBadgeStyle = {
    approved: { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)', icon: <FaCheckCircle size={11} /> },
    pending: { bg: 'rgba(245, 158, 11, 0.12)', color: '#d97706', border: '1px solid rgba(245, 158, 11, 0.25)', icon: <FaClock size={11} /> },
    rejected: { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.25)', icon: <FaTimesCircle size={11} /> },
    draft: { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.25)', icon: <FaClock size={11} /> }
  }[profile.verification_status || 'draft'] || { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.25)', icon: <FaClock size={11} /> };

  return (
    <MainLayout userRole="admin" activePage="users">
      {/* ===== HERO PAGE HEADER BANNER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            {isCourier ? <FaMotorcycle style={{ fontSize: '11px' }} /> : isSender ? <FaBoxes style={{ fontSize: '11px' }} /> : <FaShieldAlt style={{ fontSize: '11px' }} />}
            <span>{isCourier ? 'COURIER ACCOUNT DOSSIER' : isSender ? 'SENDER ACCOUNT DOSSIER' : 'USER PROFILE DETAILS'}</span>
          </div>
          <h1 className="hero-banner-title">
            {profile.name}
          </h1>
          <p className="hero-banner-subtitle">
            Comprehensive credentials, performance statistics, verification status, and delivery history.
          </p>
        </div>
        <div className="hero-banner-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            className="dashboard-btn-outline"
            onClick={() => navigate('/admin/users')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft size={13} /> Back to Users
          </button>

          {!isAdmin && profile.status === 'suspended' && (
            <button
              type="button"
              className="dashboard-btn-outline"
              onClick={handleConfirmUnsuspend}
              disabled={unsuspendLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#10b981',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                backgroundColor: 'rgba(16, 185, 129, 0.08)'
              }}
            >
              {unsuspendLoading ? <FaSpinner className="spin" size={13} /> : <FaCheckCircle size={13} />}
              Reactivate Account
            </button>
          )}

          {!isAdmin && profile.status !== 'suspended' && (
            <button
              type="button"
              className="dashboard-btn-outline"
              onClick={() => {
                setSuspendError('');
                setIsSuspendModalOpen(true);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#ef4444',
                borderColor: 'rgba(239, 68, 68, 0.4)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)'
              }}
            >
              <FaBan size={13} /> Suspend Account
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{
          padding: '14px 18px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          background: feedback.type === 'success' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: `1px solid ${feedback.type === 'success' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: feedback.type === 'success' ? '#10b981' : '#ef4444',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {feedback.type === 'success' ? <FaCheckCircle size={16} /> : <FaExclamationCircle size={16} />}
            <span>{feedback.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {profile.status === 'suspended' && (
        <div style={{
          padding: '16px 20px',
          borderRadius: '14px',
          marginBottom: '24px',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px'
        }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            flexShrink: 0
          }}>
            <FaBan />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <strong style={{ fontSize: '15px', color: '#b91c1c' }}>
                Account Currently Suspended
              </strong>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '12px',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444'
              }}>
                {profile.suspended_until ? `Until ${formatDate(profile.suspended_until)}` : 'Indefinite Duration'}
              </span>
            </div>
            <p style={{ margin: '6px 0 2px 0', fontSize: '13px', color: '#991b1b', lineHeight: 1.5 }}>
              <strong>Reason:</strong> {profile.suspension_reason || 'No specific reason provided.'}
            </p>
            {profile.suspended_at && (
              <div style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                Suspended on {formatDate(profile.suspended_at)}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
          <FaExclamationCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ===== IDENTITY OVERVIEW CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <div style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '28px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
              border: '3px solid white'
            }}>
              {profile.profile_photo ? (
                <img
                  src={profile.profile_photo}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initialsFor(profile.name)
              )}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {profile.name}
                </h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: roleBadgeStyle.bg,
                  color: roleBadgeStyle.color,
                  border: roleBadgeStyle.border,
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  {roleLabel}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                alignItems: 'center'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FaEnvelope size={12} style={{ color: 'var(--primary-color)' }} /> {profile.email}
                </span>
                {profile.phone && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <FaPhoneAlt size={12} style={{ color: 'var(--primary-color)' }} /> {profile.phone}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FaCalendarAlt size={12} style={{ color: 'var(--primary-color)' }} /> Joined {formatDate(profile.created_at || profile.joined)}
                </span>
              </div>
            </div>
          </div>

          {/* BADGES PILL GROUP */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <StatusBadge status={profile.status || 'inactive'} />
            
            {isCourier && (
              <span style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: verificationBadgeStyle.bg,
                color: verificationBadgeStyle.color,
                border: verificationBadgeStyle.border,
              }}>
                {verificationBadgeStyle.icon}
                Verification: {(profile.verification_status || 'draft').toUpperCase()}
              </span>
            )}

            {profile.email_verified_at && (
              <span style={{
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}>
                <FaCheckCircle size={11} /> Email Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ===== PLATFORM PERFORMANCE STATS ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <Stat
          label="Total Deliveries"
          value={stats.total_deliveries || 0}
          icon={<FaBoxes />}
          color="#2563eb"
        />
        <Stat
          label="Completed Deliveries"
          value={stats.completed_deliveries || 0}
          icon={<FaCheckCircle />}
          color="#10b981"
        />
        {isSender && (
          <Stat
            label="Total Spent"
            value={`${Number(stats.total_spent || 0).toFixed(2)} MAD`}
            icon={<FaWallet />}
            color="#6366f1"
          />
        )}
        {isSender && (
          <Stat
            label="Ratings Given"
            value={stats.ratings_given || 0}
            icon={<FaStar />}
            color="#f59e0b"
          />
        )}
        {isCourier && (
          <Stat
            label="Average Rating"
            value={`${Number(stats.average_rating || 0).toFixed(1)} / 5`}
            icon={<FaStar />}
            color="#f59e0b"
          />
        )}
        {isCourier && (
          <Stat
            label="Customer Reviews"
            value={stats.reviews_count || 0}
            icon={<FaFileAlt />}
            color="#3b82f6"
          />
        )}
        {isCourier && (
          <Stat
            label="Released Earnings"
            value={`${Number(stats.total_earned || 0).toFixed(2)} MAD`}
            icon={<FaWallet />}
            color="#10b981"
          />
        )}
      </div>

      {/* ===== PERSONAL INFORMATION CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge pickup">
            <FaUser />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Personal & Account Information
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Primary contact information and account registration records
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px'
        }}>
          <Field label="Full Name" value={profile.name} icon={<FaUser size={11} />} />
          <Field label="Email Address" value={profile.email} icon={<FaEnvelope size={11} />} />
          <Field label="Phone Number" value={profile.phone} icon={<FaPhoneAlt size={11} />} />
          <Field label="Residential Address" value={profile.address} icon={<FaMapMarkerAlt size={11} />} />
          <Field label="System Role" value={roleLabel} icon={<FaShieldAlt size={11} />} />
          <Field label="Account Status" value={(profile.status || 'Active').toUpperCase()} icon={<FaCheckCircle size={11} />} />
          <Field label="Registration Date" value={formatDate(profile.created_at || profile.joined)} icon={<FaCalendarAlt size={11} />} />
          <Field label="Email Verified At" value={profile.email_verified_at ? formatDate(profile.email_verified_at) : 'Not Verified'} icon={<FaCheckCircle size={11} />} />
        </div>
      </div>

      {/* ===== COURIER SPECIFIC SECTION: VEHICLE & VERIFICATION ===== */}
      {isCourier && (
        <div className="form-section-card" style={{ marginBottom: '24px' }}>
          <div className="form-card-header" style={{ marginBottom: '20px' }}>
            <div className="form-card-icon-badge destination">
              <FaTruck />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Courier & Vehicle Credentials
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Vehicle specifications, national identity, driver license, and verification audit trail
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: profile.verification_rejection_reason ? '16px' : '0'
          }}>
            <Field label="Vehicle Type" value={profile.vehicle_type} icon={<FaMotorcycle size={11} />} />
            <Field label="Vehicle Registration / Plate" value={profile.vehicle_number} icon={<FaTruck size={11} />} />
            <Field label="CIN National ID Number" value={profile.cin_number} icon={<FaIdCard size={11} />} />
            <Field label="Driver License Number" value={profile.driver_license} icon={<FaFileAlt size={11} />} />
            <Field label="Verification Status" value={(profile.verification_status || 'draft').toUpperCase()} icon={<FaClock size={11} />} />
            <Field label="Submitted For Review At" value={formatDate(profile.verification_submitted_at)} icon={<FaCalendarAlt size={11} />} />
            <Field label="Admin Reviewed At" value={formatDate(profile.verification_reviewed_at)} icon={<FaCalendarAlt size={11} />} />
          </div>

          {profile.verification_rejection_reason && (
            <div style={{
              marginTop: '16px',
              padding: '14px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <FaTimesCircle size={18} style={{ color: '#ef4444', marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong style={{ fontSize: '13px', color: '#b91c1c' }}>Rejection Reason:</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#991b1b' }}>
                  {profile.verification_rejection_reason}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== COURIER SPECIFIC SECTION: DOCUMENTS ===== */}
      {isCourier && (
        <div className="form-section-card" style={{ marginBottom: '24px' }}>
          <div className="form-card-header" style={{ marginBottom: '20px' }}>
            <div className="form-card-icon-badge pickup">
              <FaIdCard />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Courier Verification Documents
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                Official photo identity, driver license, and vehicle registration imagery
              </p>
            </div>
          </div>

          <div className="courier-doc-grid">
            {documentsFor(profile).map(({ label, doc }) => {
              const docData = getDocData(doc);
              const hasDoc = Boolean(docData?.dataUrl);

              return (
                <div
                  key={label}
                  className={`courier-doc-card ${hasDoc ? 'uploaded' : ''}`}
                  style={{ cursor: hasDoc ? 'pointer' : 'default' }}
                  onClick={() => {
                    if (hasDoc) {
                      setPreviewDoc({ label, dataUrl: docData.dataUrl });
                    }
                  }}
                >
                  {hasDoc ? (
                    <>
                      <div className="courier-doc-preview-wrapper">
                        <img
                          src={docData.dataUrl}
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
                          ✅ {docData.fileName}
                        </div>
                        {docData.uploadedAt && (
                          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Uploaded: {formatDate(docData.uploadedAt)}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        className="dashboard-btn-outline btn-sm"
                        style={{ width: '100%', padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDoc({ label, dataUrl: docData.dataUrl });
                        }}
                      >
                        <FaEye size={12} /> Inspect High-Res
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="courier-doc-placeholder-icon">
                        <FaFileAlt />
                      </div>
                      <div style={{ margin: '8px 0 4px 0' }}>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {label}
                        </div>
                        <span style={{
                          display: 'inline-block',
                          marginTop: '6px',
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '3px 10px',
                          borderRadius: '12px',
                          background: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444'
                        }}>
                          Not Uploaded
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        Pending file upload
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== REVIEWS & RATINGS SECTION ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge security" style={{ background: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b' }}>
            <FaStar />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              {isCourier ? 'Customer Feedback & Reviews' : 'Ratings & Reviews Given'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isCourier
                ? 'Direct performance ratings and written comments left by parcel senders'
                : 'Ratings and feedback submitted by this sender for assigned couriers'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px'
        }}>
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div
                key={review.id}
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                        color: 'white',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {initialsFor(isCourier ? review.sender_name : review.courier_name)}
                      </div>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                        {isCourier ? review.sender_name || 'Sender' : review.courier_name || 'Courier'}
                      </strong>
                    </div>

                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontSize: '13px' }}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          style={{
                            color: i < (review.rating || 0) ? '#f59e0b' : '#cbd5e1',
                            fontSize: '12px'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <p style={{
                    margin: '0 0 10px 0',
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: 'var(--text-primary)',
                    lineHeight: '1.5'
                  }}>
                    "{review.comment || 'No written comment left.'}"
                  </p>
                </div>

                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)'
                }}>
                  <span style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
                    {review.delivery_code || `DEL-${review.delivery_id}`}
                  </span>
                  <span>{formatDate(review.created_at)}</span>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              padding: '36px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              background: 'var(--hover-bg)',
              borderRadius: '12px',
              border: '1px dashed var(--border-color)'
            }}>
              <FaStar size={24} style={{ color: '#cbd5e1', marginBottom: '8px' }} />
              <p style={{ margin: 0, fontSize: '14px' }}>
                No reviews or ratings recorded for this user yet.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== RECENT DELIVERIES TABLE CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge pickup">
            <FaBoxes />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Recent Delivery Activity
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Most recent shipment records associated with this account
            </p>
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: '700',
            color: '#2563eb',
            background: 'rgba(37, 99, 235, 0.1)',
            padding: '4px 12px',
            borderRadius: '12px'
          }}>
            {recentDeliveries.length} Deliveries
          </div>
        </div>

        <div className="table-container dashboard-table-card">
          <table className="dashboard-table">
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
                  <tr key={delivery.id} className="table-row-hover">
                    <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>
                      {delivery.tracking_code || `DEL-${delivery.id}`}
                    </td>
                    <td style={{ fontWeight: '500' }}>{delivery.sender?.name || 'N/A'}</td>
                    <td style={{ color: delivery.courier?.name ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                      {delivery.courier?.name || 'Unassigned'}
                    </td>
                    <td><StatusBadge status={delivery.status} /></td>
                    <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                      {Number(delivery.amount || 0).toFixed(2)} MAD
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                      {formatDate(delivery.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No recent deliveries found for this user.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== HIGH-RESOLUTION DOCUMENT LIGHTBOX MODAL ===== */}
      {previewDoc && (
        <div
          className="notification-modal-backdrop"
          onClick={() => setPreviewDoc(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            padding: '20px'
          }}
        >
          <div
            className="notification-modal"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--card-background)',
              borderRadius: '20px',
              maxWidth: '750px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
              border: '1px solid var(--border-color)',
              maxHeight: '90vh',
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px',
              paddingBottom: '12px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>
                {previewDoc.label}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  padding: '6px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <FaTimes size={18} />
              </button>
            </div>

            <img
              src={previewDoc.dataUrl}
              alt={previewDoc.label}
              className="verification-lightbox-img"
              style={{
                width: '100%',
                maxHeight: '65vh',
                objectFit: 'contain',
                borderRadius: '12px',
                background: 'rgba(0, 0, 0, 0.04)',
                marginBottom: '20px'
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
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

      {/* ===== SUSPEND CONFIRMATION MODAL ===== */}
      <SuspendUserModal
        isOpen={isSuspendModalOpen}
        user={profile}
        onClose={() => {
          setIsSuspendModalOpen(false);
          setSuspendError('');
        }}
        onConfirm={handleConfirmSuspend}
        loading={suspendLoading}
        error={suspendError}
      />
    </MainLayout>
  );
};

export default UserProfile;

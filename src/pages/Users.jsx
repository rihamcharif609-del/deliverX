import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import SuspendUserModal from '../components/SuspendUserModal';
import { useLanguage } from '../context/LanguageContext';
import { SectionLoading } from '../components/LoadingSpinner';
import { 
  FaUsers, 
  FaShieldAlt, 
  FaBoxes, 
  FaTruck, 
  FaSearch, 
  FaExclamationCircle,
  FaCheckCircle,
  FaBan,
  FaSpinner,
  FaTimes
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const Users = ({ setUserRole }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Notification banners
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  // Suspend modal state
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState(null);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendError, setSuspendError] = useState('');

  // Unsuspend modal state
  const [userToUnsuspend, setUserToUnsuspend] = useState(null);
  const [unsuspendLoading, setUnsuspendLoading] = useState(false);
  const [unsuspendError, setUnsuspendError] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    setError('');

    try {
      const { data } = await axios.get(`${API_BASE_URL}/admin/users`);
      setUsers(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load users from the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-dismiss feedback message after 5 seconds
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  // Handle opening Suspend Modal
  const handleOpenSuspend = (user) => {
    setUserToSuspend(user);
    setSuspendError('');
    setIsSuspendModalOpen(true);
  };

  // Handle confirming Suspend
  const handleConfirmSuspend = async ({ userId, duration, reason }) => {
    setSuspendLoading(true);
    setSuspendError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/users/${userId}/suspend`, {
        duration,
        reason,
      });

      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, ...data.data, status: 'suspended' } : u))
      );

      setFeedback({
        type: 'success',
        message: data.message || `User account successfully suspended.`,
      });

      setIsSuspendModalOpen(false);
      setUserToSuspend(null);
    } catch (err) {
      setSuspendError(err.response?.data?.message || 'Failed to suspend user account.');
    } finally {
      setSuspendLoading(false);
    }
  };

  // Handle opening Unsuspend Modal
  const handleOpenUnsuspend = (user) => {
    setUserToUnsuspend(user);
    setUnsuspendError('');
  };

  // Handle confirming Unsuspend
  const handleConfirmUnsuspend = async () => {
    if (!userToUnsuspend) return;
    setUnsuspendLoading(true);
    setUnsuspendError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/admin/users/${userToUnsuspend.id}/unsuspend`);

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userToUnsuspend.id
            ? { ...u, ...data.data, status: 'active', suspended_until: null, suspension_reason: null }
            : u
        )
      );

      setFeedback({
        type: 'success',
        message: data.message || `Account for ${userToUnsuspend.name} successfully reactivated.`,
      });

      setUserToUnsuspend(null);
    } catch (err) {
      setUnsuspendError(err.response?.data?.message || 'Failed to unsuspend user account.');
    } finally {
      setUnsuspendLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const sendersCount = users.filter((u) => u.role === 'sender').length;
  const couriersCount = users.filter((u) => u.role === 'courier').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  const metricCards = [
    { key: 'all', label: 'All Users', count: users.length, icon: <FaUsers />, color: '#2563eb' },
    { key: 'sender', label: 'Senders', count: sendersCount, icon: <FaBoxes />, color: '#3b82f6' },
    { key: 'courier', label: 'Couriers', count: couriersCount, icon: <FaTruck />, color: '#10b981' },
    { key: 'suspended', label: 'Suspended', count: suspendedCount, icon: <FaBan />, color: '#ef4444', isStatus: true },
    { key: 'admin', label: 'Administrators', count: adminsCount, icon: <FaShieldAlt />, color: '#f59e0b' },
  ];

  const handleMetricCardClick = (card) => {
    if (card.isStatus) {
      setRoleFilter('all');
      setStatusFilter(card.key);
    } else {
      setStatusFilter('all');
      setRoleFilter(card.key);
    }
  };

  return (
    <MainLayout userRole="admin" activePage="users" setUserRole={setUserRole}>
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>USER DIRECTORY & ACCESS CONTROL</span>
          </div>
          <h1 className="hero-banner-title">
            {t('manageUsers')} 👥
          </h1>
          <p className="hero-banner-subtitle">
            {t('manageUsersDesc') || 'View, filter, and manage registered senders, couriers, and administrators across the platform.'}
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
            <FaUsers /> {users.length} Registered User{users.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* ===== SYSTEM FEEDBACK BANNER ===== */}
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
            <span>{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'inherit',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <FaTimes size={14} />
          </button>
        </div>
      )}

      {/* ===== HORIZONTAL METRIC FILTER CARDS ===== */}
      <div className="delivery-metrics-row" style={{ marginBottom: '24px' }}>
        {metricCards.map((card) => {
          const isActive = card.isStatus
            ? statusFilter === card.key
            : roleFilter === card.key && statusFilter === 'all';

          return (
            <div
              key={card.key}
              className={`metric-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => handleMetricCardClick(card)}
              style={{ cursor: 'pointer' }}
            >
              <div className="metric-card-top">
                <span className="metric-card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                  {card.icon}
                </span>
                <span className="metric-card-count" style={{ color: isActive ? card.color : 'var(--text-primary)' }}>
                  {card.count}
                </span>
              </div>
              <div className="metric-card-label">{card.label}</div>
            </div>
          );
        })}
      </div>

      {/* ===== SEARCH & TOOLBAR ===== */}
      <div className="deliveries-toolbar">
        <div className="toolbar-search-box">
          <FaSearch className="toolbar-search-icon" />
          <input
            type="text"
            placeholder="Search by user name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="toolbar-search-input"
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="admin-table-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="sender">Senders</option>
            <option value="courier">Couriers</option>
            <option value="admin">Administrators</option>
          </select>

          <select
            className="admin-table-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="inactive">Inactive</option>
          </select>

          <div className="toolbar-active-filter-tag">
            Showing: <strong>{filteredUsers.length}</strong> of {users.length}
          </div>
        </div>
      </div>

      {/* ===== USERS TABLE ===== */}
      <SectionLoading loading={isLoading} label="Loading users..." minHeight="240px">
        <UserTable
          users={filteredUsers}
          showActions={true}
          onViewUser={(user) =>
            navigate(`/admin/users/${user.id}`, { state: { user } })
          }
          onSuspendUser={handleOpenSuspend}
          onUnsuspendUser={handleOpenUnsuspend}
        />
      </SectionLoading>

      {error && (
        <div className="form-submit-error-banner" style={{ marginTop: '16px' }}>
          <FaExclamationCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* ===== PAGINATION FOOTER ===== */}
      <div className="deliveries-pagination-footer">
        <p className="pagination-info">Showing {filteredUsers.length} of {users.length} registered users</p>
        <div className="pagination-controls">
          <button type="button" className="dashboard-btn-outline btn-sm" disabled>Previous</button>
          <button type="button" className="dashboard-btn-primary btn-sm" style={{ minWidth: '36px' }}>1</button>
          <button type="button" className="dashboard-btn-outline btn-sm" disabled>Next</button>
        </div>
      </div>

      {/* ===== SUSPEND CONFIRMATION MODAL ===== */}
      <SuspendUserModal
        isOpen={isSuspendModalOpen}
        user={userToSuspend}
        onClose={() => {
          setIsSuspendModalOpen(false);
          setUserToSuspend(null);
          setSuspendError('');
        }}
        onConfirm={handleConfirmSuspend}
        loading={suspendLoading}
        error={suspendError}
      />

      {/* ===== UNSUSPEND CONFIRMATION MODAL ===== */}
      {userToUnsuspend && (
        <div className="courier-modal-backdrop" onClick={() => !unsuspendLoading && setUserToUnsuspend(null)}>
          <div
            className="courier-modal-card"
            style={{ maxWidth: '480px', width: '100%', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setUserToUnsuspend(null)}
              disabled={unsuspendLoading}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: unsuspendLoading ? 'not-allowed' : 'pointer',
                padding: '6px',
              }}
            >
              <FaTimes size={16} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                flexShrink: 0
              }}>
                <FaCheckCircle />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
                  Reactivate Account
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  Restore full platform access for this user
                </p>
              </div>
            </div>

            {unsuspendError && (
              <div style={{
                marginBottom: '16px',
                padding: '12px 14px',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444',
                fontSize: '13px',
              }}>
                {unsuspendError}
              </div>
            )}

            <div style={{
              padding: '14px 16px',
              background: 'var(--hover-bg, #f8fafc)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div><strong>User:</strong> {userToUnsuspend.name} ({userToUnsuspend.email})</div>
              <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{userToUnsuspend.role}</span></div>
              {userToUnsuspend.suspension_reason && (
                <div><strong>Previous Reason:</strong> {userToUnsuspend.suspension_reason}</div>
              )}
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              Are you sure you want to lift the suspension for <strong>{userToUnsuspend.name}</strong>? The user will immediately be permitted to log in, create shipments, or accept deliveries.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="dashboard-btn-outline"
                onClick={() => setUserToUnsuspend(null)}
                disabled={unsuspendLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmUnsuspend}
                disabled={unsuspendLoading}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: '700',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: unsuspendLoading ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)',
                }}
              >
                {unsuspendLoading ? (
                  <>
                    <FaSpinner className="spin" size={14} /> Lifting Suspension...
                  </>
                ) : (
                  <>
                    <FaCheckCircle size={13} /> Confirm Reactivation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default Users;

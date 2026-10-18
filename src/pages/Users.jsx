import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import { useLanguage } from '../context/LanguageContext';
import { SectionLoading } from '../components/LoadingSpinner';
import { 
  FaUsers, 
  FaShieldAlt, 
  FaBoxes, 
  FaTruck, 
  FaSearch, 
  FaExclamationCircle 
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

  useEffect(() => {
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

    fetchUsers();
  }, []);

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
  const adminsCount = users.filter((u) => u.role === 'admin').length;

  const metricCards = [
    { key: 'all', label: 'All Users', count: users.length, icon: <FaUsers />, color: '#2563eb' },
    { key: 'sender', label: 'Senders', count: sendersCount, icon: <FaBoxes />, color: '#3b82f6' },
    { key: 'courier', label: 'Couriers', count: couriersCount, icon: <FaTruck />, color: '#10b981' },
    { key: 'admin', label: 'Administrators', count: adminsCount, icon: <FaShieldAlt />, color: '#f59e0b' },
  ];

  return (
    <MainLayout userRole="admin" activePage="users" setUserRole={setUserRole}>
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>USER DIRECTORY & ACCESS</span>
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

      {/* ===== HORIZONTAL METRIC FILTER CARDS ===== */}
      <div className="delivery-metrics-row" style={{ marginBottom: '24px' }}>
        {metricCards.map((card) => {
          const isActive = roleFilter === card.key;
          return (
            <div
              key={card.key}
              className={`metric-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => setRoleFilter(card.key)}
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
    </MainLayout>
  );
};

export default Users;


import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import { useLanguage } from '../context/LanguageContext';

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

  const stats = [
    { title: 'Total Users', value: String(users.length), change: 'From database', icon: '👥', trend: 'positive' },
    { title: 'Total Senders', value: String(users.filter((u) => u.role === 'sender').length), change: 'Registered senders', icon: '📦', trend: 'positive' },
    { title: 'Total Couriers', value: String(users.filter((u) => u.role === 'courier').length), change: 'Registered couriers', icon: '🚚', trend: 'positive' },
  ];

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <MainLayout userRole="admin" activePage="users" setUserRole={setUserRole}>
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('manageUsers')}</h1>
            <p className="page-subtitle">{t('manageUsersDesc')}</p>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginBottom: '30px' }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="filters-section">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-group">
            <select
              className="filter-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="sender">Sender</option>
              <option value="courier">Courier</option>
              <option value="admin">Admin</option>
            </select>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {isLoading && (
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>Loading users...</p>
        )}
        {error && (
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        )}

        <UserTable
          users={filteredUsers}
          showActions={true}
          onViewUser={(user) =>
            navigate(`/admin/users/${user.id}`, { state: { user } })
          }
        />

        <div className="pagination">
          <p className="pagination-info">Showing {filteredUsers.length} of {users.length} users</p>
          <div className="pagination-controls">
            <button className="btn btn-outline" disabled>Previous</button>
            <button className="btn btn-primary">1</button>
            <button className="btn btn-outline" disabled>Next</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;

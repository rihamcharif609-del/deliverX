import React, { useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import { useLanguage } from '../context/LanguageContext';
import { useCourierVerification } from '../context/CourierVerificationContext';

const verificationToUserStatus = (verificationStatus) => {
  if (verificationStatus === 'approved') return 'active';
  if (verificationStatus === 'rejected') return 'inactive';
  return 'pending';
};

const Users = ({ setUserRole }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { profile, verificationStatus, verification } = useCourierVerification();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const liveCourierUser = useMemo(
    () => ({
      id: 'courier-live',
      name: profile.name,
      email: profile.email,
      role: 'courier',
      status: verificationToUserStatus(verificationStatus),
      joined: verification.submittedAt
        ? new Date(verification.submittedAt).toLocaleDateString()
        : '—',
      deliveries: profile.completedDeliveries ?? 0,
      isLiveCourier: true,
    }),
    [profile, verificationStatus, verification.submittedAt]
  );

  const users = useMemo(
    () => [
      liveCourierUser,
      { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'sender', status: 'active', joined: '2024-01-15', deliveries: 45 },
      { id: 3, name: 'Michael Brown', email: 'michael.b@example.com', role: 'admin', status: 'active', joined: '2023-11-10', deliveries: 0 },
      { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'sender', status: 'inactive', joined: '2024-01-20', deliveries: 12 },
      { id: 6, name: 'Lisa Anderson', email: 'lisa.a@example.com', role: 'sender', status: 'inactive', joined: '2024-03-01', deliveries: 3 },
      { id: 8, name: 'Maria Garcia', email: 'maria.g@example.com', role: 'sender', status: 'inactive', joined: '2023-12-12', deliveries: 8 },
    ],
    [liveCourierUser]
  );

  const stats = [
    { title: 'Total Senders', value: String(users.filter((u) => u.role === 'sender').length), change: 'In this list', icon: '📦', trend: 'positive' },
    { title: 'Total Couriers', value: '1', change: liveCourierUser.name, icon: '🚚', trend: 'positive' },
    { title: 'Verification', value: verificationStatus, change: verificationStatus === 'approved' ? 'Can deliver' : 'Review needed', icon: '👥', trend: 'positive' },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        {stats.slice(0, 3).map((stat, index) => (
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
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        <UserTable
          users={filteredUsers}
          showActions={true}
          onViewUser={(user) =>
            navigate(`/admin/users/${user.id}`, { state: { user } })
          }
        />

        <div className="pagination">
          <p className="pagination-info">Showing 1-8 of 24 users</p>
          <div className="pagination-controls">
            <button className="btn btn-outline" disabled>Previous</button>
            <button className="btn btn-primary">1</button>
            <button className="btn btn-outline">2</button>
            <button className="btn btn-outline">3</button>
            <button className="btn btn-outline">Next</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Users;
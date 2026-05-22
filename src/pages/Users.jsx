import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import StatCard from '../components/StatCard';
import { useNavigate } from 'react-router-dom';
import UserTable from '../components/UserTable';
import { useLanguage } from '../context/LanguageContext';

const Users = ({ navigateTo }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    { title: 'Total Senders', value: '1,247', change: '+23 this week', icon: '📦', trend: 'positive' },
    { title: 'Total Couriers', value: '145', change: '+8 this week', icon: '🚚', trend: 'positive' },
    { title: 'Active Users', value: '1,356', change: '97.4% of total', icon: '👥', trend: 'positive' },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const users = [
    { id: 1, name: 'John Smith', email: 'john.smith@example.com', role: 'sender', status: 'active', joined: '2024-01-15', deliveries: 45 },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'courier', status: 'active', joined: '2024-02-01', deliveries: 128 },
    { id: 3, name: 'Michael Brown', email: 'michael.b@example.com', role: 'admin', status: 'active', joined: '2023-11-10', deliveries: 0 },
    { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'sender', status: 'inactive', joined: '2024-01-20', deliveries: 12 },
    { id: 5, name: 'David Wilson', email: 'david.w@example.com', role: 'courier', status: 'active', joined: '2024-02-15', deliveries: 67 },
    { id: 6, name: 'Lisa Anderson', email: 'lisa.a@example.com', role: 'sender', status: 'inactive', joined: '2024-03-01', deliveries: 3 },
    { id: 7, name: 'James Taylor', email: 'james.t@example.com', role: 'courier', status: 'active', joined: '2024-01-05', deliveries: 92 },
    { id: 8, name: 'Maria Garcia', email: 'maria.g@example.com', role: 'sender', status: 'inactive', joined: '2023-12-12', deliveries: 8 },
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role) => {
    const styles = {
      sender: { backgroundColor: '#e0f2fe', color: '#0369a1' },
      courier: { backgroundColor: '#dcfce7', color: '#166534' },
      admin: { backgroundColor: '#fef9c3', color: '#854d0e' }
    };
    return (
      <span style={{
        padding: '4px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '500',
        ...styles[role]
      }}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  return (
    <MainLayout userRole="admin" activePage="users" onNavigate={navigateTo} 
  >
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
  onViewUser={(user) => navigate(`/admin/users/${user.id}`)}
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
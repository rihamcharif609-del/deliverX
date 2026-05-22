import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import DeliveryTable from '../components/DeliveryTable';

const Dashboard = ({ navigateTo, userRole = 'sender' }) => {
  const { t } = useLanguage();
  const stats = {
    sender: [
      { title: 'Total Orders', value: '156', change: '+12%', icon: '📦', trend: 'positive' },
      { title: 'Active Deliveries', value: '8', change: '+2', icon: '🚚', trend: 'positive' },
      { title: 'Average Time', value: '45min', change: '-5min', icon: '⏱️', trend: 'positive' },
      { title: 'Spent This Month', value: '$1,245', change: '+8%', icon: '💰', trend: 'positive' },
    ],
    courier: [
      { title: 'Completed Today', value: '12', change: '+3', icon: '✅', trend: 'positive' },
      { title: 'Total Earnings', value: '$245', change: '+$45', icon: '💰', trend: 'positive' },
      { title: 'Active Deliveries', value: '3', change: '-1', icon: '🚚', trend: 'negative' },
      { title: 'Rating', value: '4.8', change: '+0.2', icon: '⭐', trend: 'positive' },
    ],
    admin: [
      { title: 'Total Orders', value: '2,845', change: '+15%', icon: '📦', trend: 'positive' },
      { title: 'Active Users', value: '1,234', change: '+89', icon: '👥', trend: 'positive' },
      { title: 'Revenue', value: '$45,678', change: '+23%', icon: '💰', trend: 'positive' },
      { title: 'Avg Delivery Time', value: '38min', change: '-12%', icon: '⏱️', trend: 'positive' },
    ]
  };

  const currentStats = stats[userRole] || stats.sender;

  return (
    <MainLayout userRole={userRole} activePage="dashboard" onNavigate={navigateTo} 
  >
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('dashboard')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Welcome back, John! Here's what's happening with your deliveries today.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        {currentStats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div style={{ marginBottom: '30px' }}>
        <ChartPlaceholder title="Delivery Overview" type="bar" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: '30px' }}>
        <ChartPlaceholder title="Status Distribution" type="pie" />
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ width: '40px', height: '40px', backgroundColor: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {i % 2 === 0 ? '📦' : '🚚'}
                </div>
                <div>
                  <p style={{ fontWeight: '500', marginBottom: '4px' }}>Delivery #{`DEL00${i}`} {i % 2 === 0 ? 'picked up' : 'delivered'}</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>5 minutes ago</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Recent Deliveries</h3>
          <button className="btn btn-outline" onClick={() => navigateTo('deliveries')}>View All</button>
        </div>
        <DeliveryTable showActions={true} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
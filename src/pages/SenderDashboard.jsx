import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import DeliveryTable from '../components/DeliveryTable';
import { useNavigate } from 'react-router-dom';
import SenderDeliveryTable from '../components/SenderDeliveryTable';

const SenderDashboard = ({ navigateTo }) => {
  const { t } = useLanguage();
  const stats = [
    { title: 'Total Orders', value: '156', change: '+12%', icon: '📦', trend: 'positive' },
    { title: 'Active Deliveries', value: '8', change: '+2', icon: '🚚', trend: 'positive' },
    { title: 'Average Time', value: '45min', change: '-5min', icon: '⏱️', trend: 'positive' },
    { title: 'Spent This Month', value: '$1,245', change: '+8%', icon: '💰', trend: 'positive' },
  ];

  const navigate = useNavigate();

  return (
    <MainLayout userRole="sender" activePage="sender" onNavigate={navigateTo} 
  >
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('dashboard')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your deliveries and track packages</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: '30px' }}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: '30px' }}>
        <ChartPlaceholder title="Delivery History" type="bar" />
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%' }}
              onClick={() => navigate('/sender/create')}
            >
              Create New Delivery
            </button>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%' }}
              onClick={() => navigate('/sender/tracking')}
            >
              Track Package
            </button>
            <button 
              className="btn btn-outline" 
              style={{ width: '100%' }}
              onClick={() => navigate('/sender/deliveries')}
            >
              View All Deliveries
            </button>
          </div>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>My Recent Deliveries</h3>
          <button className="btn btn-outline" onClick={() => navigate('/sender/deliveries')}>View All</button>
        </div>
        <SenderDeliveryTable showActions={false} />
      </div>
    </MainLayout>
  );
};

export default SenderDashboard;
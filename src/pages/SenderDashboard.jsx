import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import { useNavigate } from 'react-router-dom';
import SenderDeliveryTable from '../components/SenderDeliveryTable';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';

const SenderDashboard = ({ navigateTo }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { deliveries, fetchDeliveries } = useDelivery();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries('sender').catch(() => {});
  }, [fetchDeliveries]);

  const activeDeliveries = deliveries.filter((delivery) =>
    ['accepted', 'paid', 'picked-up', 'in-transit', 'waiting-courier'].includes(delivery.status)
  );
  const totalSpent = deliveries.reduce((sum, delivery) => sum + (Number(delivery.amount) || 0), 0);

  const stats = [
    { title: 'Total Orders', value: String(deliveries.length), change: 'Your account', icon: 'DX', trend: 'positive' },
    { title: 'Active Deliveries', value: String(activeDeliveries.length), change: activeDeliveries.length ? 'In progress' : 'None active', icon: 'TR', trend: 'positive' },
    { title: 'Delivered', value: String(deliveries.filter((delivery) => delivery.status === 'delivered').length), change: 'Completed', icon: 'OK', trend: 'positive' },
    { title: 'Total Spent', value: `${totalSpent.toFixed(0)} MAD`, change: 'All time', icon: 'MAD', trend: 'positive' },
  ];

  return (
    <MainLayout userRole="sender" activePage="sender" onNavigate={navigateTo}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('dashboard')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Welcome back, {user?.name || 'Sender'}. Manage your deliveries and track packages.
        </p>
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
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/sender/create')}>
              Create New Delivery
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/sender/tracking')}>
              Track Package
            </button>
            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/sender/deliveries')}>
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

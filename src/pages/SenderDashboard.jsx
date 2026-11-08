import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import StatCard from '../components/StatCard';
import ChartPlaceholder from '../components/ChartPlaceholder';
import { useNavigate } from 'react-router-dom';
import SenderDeliveryTable from '../components/SenderDeliveryTable';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';
import { SectionLoading } from '../components/LoadingSpinner';
import { FaPlus, FaSearchLocation, FaBoxes, FaArrowRight, FaBox, FaShieldAlt, FaBullhorn, FaTimes } from 'react-icons/fa';

const SenderDashboard = ({ navigateTo }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { deliveries, deliveriesLoading, fetchDeliveries } = useDelivery();
  const navigate = useNavigate();
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  useEffect(() => {
    fetchDeliveries('sender').catch(() => {});
    axios.get('http://localhost:8000/api/v1/announcements')
      .then((res) => {
        if (res.data?.summary?.latest_unread) {
          setActiveAnnouncement(res.data.summary.latest_unread);
        }
      })
      .catch(() => {});
  }, [fetchDeliveries]);

  const activeDeliveries = deliveries.filter((delivery) =>
    ['accepted', 'paid', 'picked-up', 'in-transit', 'waiting-courier'].includes(delivery.status)
  );
  const paidStatuses = new Set(['held', 'released', 'paid']);
  const totalSpent = deliveries.reduce((sum, delivery) => (
    paidStatuses.has(delivery.paymentStatus) ? sum + Number(delivery.amount || 0) : sum
  ), 0);

  const currentYear = new Date().getFullYear();
  const monthlySpend = new Array(12).fill(0);
  deliveries.forEach((d) => {
    const dateStr = d.createdAt || d.date;
    if (!dateStr) return;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return;
    if (date.getFullYear() === currentYear && paidStatuses.has(d.paymentStatus)) {
      monthlySpend[date.getMonth()] += Number(d.amount || 0);
    }
  });

  const stats = [
    { title: 'Total Orders', value: String(deliveries.length), change: 'All time', icon: 'DX', trend: 'positive' },
    { title: 'Active Deliveries', value: String(activeDeliveries.length), change: activeDeliveries.length ? 'In progress' : 'None active', icon: 'TR', trend: 'positive' },
    { title: 'Delivered', value: String(deliveries.filter((delivery) => delivery.status === 'delivered').length), change: 'Completed', icon: 'OK', trend: 'positive' },
    { title: 'Total Spent', value: `${totalSpent.toFixed(0)} MAD`, change: 'All time', icon: 'MAD', trend: 'positive' },
  ];

  return (
    <MainLayout userRole="sender" activePage="sender" onNavigate={navigateTo}>
      {/* ===== HERO WELCOME BANNER (MATCHING LANDING PAGE HERO) ===== */}
      <div className="dashboard-hero-banner">
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>SENDER PORTAL</span>
          </div>
          <h1 className="hero-banner-title">
            Welcome back, {user?.name || 'Sender'} 👋
          </h1>
          <p className="hero-banner-subtitle">
            Manage your deliveries, track packages in real-time, and get live status updates with DeliverX.
          </p>
        </div>
        <div className="hero-banner-actions">
          <button 
            className="hero-banner-btn-primary"
            onClick={() => navigate('/sender/create')}
          >
            <FaPlus /> Create New Delivery
          </button>
        </div>
      </div>

      {/* ===== ACTIVE GLOBAL ANNOUNCEMENT BANNER ===== */}
      {activeAnnouncement && (
        <div style={{
          marginBottom: '24px',
          padding: '14px 18px',
          borderRadius: '14px',
          background: 
            activeAnnouncement.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' :
            activeAnnouncement.type === 'important' ? 'rgba(239, 68, 68, 0.1)' :
            activeAnnouncement.type === 'maintenance' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(37, 99, 235, 0.1)',
          border: `1px solid ${
            activeAnnouncement.type === 'warning' ? 'rgba(245, 158, 11, 0.3)' :
            activeAnnouncement.type === 'important' ? 'rgba(239, 68, 68, 0.3)' :
            activeAnnouncement.type === 'maintenance' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(37, 99, 235, 0.3)'
          }`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FaBullhorn color={
              activeAnnouncement.type === 'warning' ? '#f59e0b' :
              activeAnnouncement.type === 'important' ? '#ef4444' :
              activeAnnouncement.type === 'maintenance' ? '#8b5cf6' : '#2563eb'
            } size={18} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  {activeAnnouncement.title}
                </strong>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '800',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  textTransform: 'uppercase',
                  background: 'var(--card-background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)'
                }}>
                  {activeAnnouncement.type_label}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                {activeAnnouncement.message}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="dashboard-btn-outline btn-sm"
              onClick={() => navigate('/sender/announcements')}
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              View All Notices
            </button>
            <button
              type="button"
              onClick={() => setActiveAnnouncement(null)}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
              title="Dismiss banner"
            >
              <FaTimes size={13} />
            </button>
          </div>
        </div>
      )}

      <SectionLoading loading={deliveriesLoading} label="Loading dashboard...">
        {/* ===== STATS GRID (ALWAYS HORIZONTAL ROW) ===== */}
        <div className="stats-row-container" style={{ marginBottom: '28px' }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* ===== ANALYTICS & QUICK ACTIONS ===== */}
        <div className="dashboard-grid grid-5" style={{ marginBottom: '28px' }}>
          <ChartPlaceholder 
            title="Monthly Spend History" 
            type="bar" 
            values={monthlySpend}
            subtitle={`Total Spent in ${currentYear}: ${monthlySpend.reduce((a, b) => a + b, 0).toFixed(2)} MAD (All-time: ${totalSpent.toFixed(2)} MAD)`}
            legendLabel="Spent (MAD)"
            color="#2563eb"
          />

          <div className="quick-actions-card">
            <div className="quick-actions-header">
              <h3>Quick Actions</h3>
              <p>Common tasks and shortcuts</p>
            </div>
            <div className="quick-actions-buttons">
              <button 
                className="dashboard-btn-primary" 
                onClick={() => navigate('/sender/create')}
              >
                <FaPlus /> Create New Delivery
              </button>
              <button 
                className="dashboard-btn-outline" 
                onClick={() => navigate('/sender/tracking')}
              >
                <FaSearchLocation /> Track Package
              </button>
              <button 
                className="dashboard-btn-outline" 
                onClick={() => navigate('/sender/deliveries')}
              >
                <FaBoxes /> View All Deliveries
              </button>
            </div>
          </div>
        </div>

        {/* ===== RECENT DELIVERIES ===== */}
        <div className="recent-deliveries-section">
          <div className="recent-deliveries-header">
            <div>
              <h3>My Recent Deliveries</h3>
              <p className="recent-deliveries-sub">Your latest package shipments and active orders</p>
            </div>
            <button 
              className="dashboard-btn-outline btn-sm" 
              onClick={() => navigate('/sender/deliveries')}
            >
              View All <FaArrowRight style={{ fontSize: '11px', marginLeft: '4px' }} />
            </button>
          </div>
          <SenderDeliveryTable deliveries={deliveries} limit={2} showActions={false} />
        </div>
      </SectionLoading>
    </MainLayout>
  );
};

export default SenderDashboard;


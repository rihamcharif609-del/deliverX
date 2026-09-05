import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import MainLayout from '../layouts/MainLayout';
import SenderDeliveryTable from '../components/SenderDeliveryTable';
import PaymentModal from '../components/PaymentModal';
import { SectionLoading } from '../components/LoadingSpinner';
import { FaPlus, FaSearch, FaBox, FaClock, FaTruck, FaCheckCircle, FaTimesCircle, FaBoxes } from 'react-icons/fa';

const SenderDeliveries = ({ userRole }) => {
  const { t } = useLanguage();
  const { deliveries, deliveriesError, deliveriesLoading, fetchDeliveries } = useDelivery();
  
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [payTargetDelivery, setPayTargetDelivery] = useState(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchDeliveries('sender').catch(() => {});
  }, [fetchDeliveries]);

  const handleOpenPayment = (delivery) => {
    setPayTargetDelivery(delivery);
    setIsPaymentOpen(true);
  };

  // Compute status counts for metrics cards
  const allCount = deliveries.length;
  const pendingCount = deliveries.filter((d) => ['waiting-courier', 'accepted', 'paid'].includes(d.status)).length;
  const inTransitCount = deliveries.filter((d) => ['picked-up', 'in-transit'].includes(d.status)).length;
  const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;
  const cancelledCount = deliveries.filter((d) => d.status === 'cancelled').length;

  const filterCards = [
    { key: 'All', label: 'All Shipments', count: allCount, icon: <FaBoxes />, color: '#2563eb' },
    { key: 'Pending', label: 'Pending / Unpaid', count: pendingCount, icon: <FaClock />, color: '#f59e0b' },
    { key: 'In Transit', label: 'In Transit', count: inTransitCount, icon: <FaTruck />, color: '#3b82f6' },
    { key: 'Delivered', label: 'Delivered', count: deliveredCount, icon: <FaCheckCircle />, color: '#10b981' },
    { key: 'Cancelled', label: 'Cancelled', count: cancelledCount, icon: <FaTimesCircle />, color: '#ef4444' },
  ];

  return (
    <MainLayout userRole="sender" activePage="sender-deliveries">
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaBox style={{ fontSize: '11px' }} />
            <span>MY SHIPMENTS & DELIVERIES</span>
          </div>
          <h1 className="hero-banner-title">
            Deliveries Overview
          </h1>
          <p className="hero-banner-subtitle">
            Track, manage, and process payments for all your Moroccan package deliveries in real-time.
          </p>
        </div>
        <div className="hero-banner-actions">
          <button 
            className="hero-banner-btn-primary"
            onClick={() => navigate('/sender/create')}
          >
            <FaPlus /> New Delivery Request
          </button>
        </div>
      </div>

      {/* ===== HORIZONTAL METRIC FILTER CARDS ===== */}
      <div className="delivery-metrics-row" style={{ marginBottom: '24px' }}>
        {filterCards.map((card) => {
          const isActive = activeFilter === card.key;
          return (
            <div
              key={card.key}
              className={`metric-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => setActiveFilter(card.key)}
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
            placeholder={t('searchPlaceholder') || 'Search by Order ID, pickup, or destination city...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>
        <div className="toolbar-active-filter-tag">
          Showing: <strong>{activeFilter}</strong>
        </div>
      </div>

      {/* ===== DELIVERIES TABLE ===== */}
      <SectionLoading loading={deliveriesLoading} label="Loading deliveries..." minHeight="280px">
        <SenderDeliveryTable  
          deliveries={deliveries}
          selectedFilter={activeFilter} 
          searchQuery={searchQuery}
          onPayClick={handleOpenPayment}
        />
      </SectionLoading>

      {deliveriesError && (
        <p style={{ marginTop: '16px', color: '#ef4444', fontWeight: '600' }}>{deliveriesError}</p>
      )}

      {/* ===== PAGINATION FOOTER ===== */}
      <div className="deliveries-pagination-footer">
        <p className="pagination-info">
          Showing {deliveries.length} delivery request{deliveries.length !== 1 ? 's' : ''} in total
        </p>
        <div className="pagination-controls">
          <button className="dashboard-btn-outline btn-sm" disabled>Previous</button>
          <button className="dashboard-btn-primary btn-sm" style={{ minWidth: '36px' }}>1</button>
          <button className="dashboard-btn-outline btn-sm">Next</button>
        </div>
      </div>

      {/* CMI Secure Payment Gateway Modal */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setPayTargetDelivery(null);
        }}
        delivery={payTargetDelivery}
      />
    </MainLayout>
  );
};

export default SenderDeliveries;


import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import DeliveryTable from '../components/DeliveryTable';
import DeliveryDetailModal from '../components/DeliveryDetailModal';
import { SectionLoading } from '../components/LoadingSpinner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FaShieldAlt, 
  FaBoxes, 
  FaSearch, 
  FaClock, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFilePdf,
  FaExclamationCircle 
} from 'react-icons/fa';

const AdminDeliveries = ({ setUserRole, userRole }) => {
  const { t } = useLanguage();
  const { deliveries, deliveriesError, deliveriesLoading, fetchDeliveries } = useDelivery();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const tableDataRef = useRef([]);

  useEffect(() => {
    fetchDeliveries('admin').catch(() => {});
  }, [fetchDeliveries]);

  // Compute status counts for metrics cards
  const allCount = deliveries.length;
  const pendingCount = deliveries.filter((d) => ['pending', 'accepted', 'waiting-courier', 'paid'].includes(d.status)).length;
  const inTransitCount = deliveries.filter((d) => ['in-transit', 'picked-up'].includes(d.status)).length;
  const deliveredCount = deliveries.filter((d) => d.status === 'delivered').length;
  const cancelledCount = deliveries.filter((d) => d.status === 'cancelled').length;

  const filterCards = [
    { key: 'All', label: 'All Shipments', count: allCount, icon: <FaBoxes />, color: '#2563eb' },
    { key: 'Pending', label: 'Pending', count: pendingCount, icon: <FaClock />, color: '#f59e0b' },
    { key: 'In Transit', label: 'In Transit', count: inTransitCount, icon: <FaTruck />, color: '#3b82f6' },
    { key: 'Delivered', label: 'Delivered', count: deliveredCount, icon: <FaCheckCircle />, color: '#10b981' },
    { key: 'Cancelled', label: 'Cancelled', count: cancelledCount, icon: <FaTimesCircle />, color: '#ef4444' },
  ];

  const handleExportPDF = () => {
    const doc = new jsPDF();

    const tableColumn = [
      'Order ID',
      'Customer',
      'Courier',
      'Date',
      'Status',
      'Total',
    ];

    const tableRows = tableDataRef.current.map((d) => [
      d.id,
      d.customer,
      d.Courier || d.courier || 'Unassigned',
      d.date,
      d.status,
      `${(d.total || d.amount || 0).toFixed(2)} MAD`,
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
    });

    doc.save('deliveries-report.pdf');
  };

  return (
    <MainLayout
      userRole={userRole || 'admin'}
      activePage="admin-deliveries"
      setUserRole={setUserRole}
    >
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>ADMINISTRATIVE OVERSIGHT</span>
          </div>
          <h1 className="hero-banner-title">
            {t('allDeliveries')} 📦
          </h1>
          <p className="hero-banner-subtitle">
            {t('allDeliveriesDesc') || 'Real-time monitoring of all platform deliveries across Moroccan regions, courier assignments, and escrow transactions.'}
          </p>
        </div>
        <div className="hero-banner-actions">
          <button 
            type="button"
            className="hero-banner-btn-primary" 
            onClick={handleExportPDF}
          >
            <FaFilePdf /> {t('exportPDF')}
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
            placeholder={t('searchCustomer') || 'Search by customer name, order ID, or courier...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="toolbar-search-input"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div className="toolbar-active-filter-tag">
            Showing: <strong>{activeFilter}</strong> ({tableDataRef.current?.length ?? deliveries.length})
          </div>
          <button 
            type="button" 
            className="dashboard-btn-outline btn-sm"
            onClick={handleExportPDF}
            style={{ width: 'auto' }}
          >
            <FaFilePdf /> Export PDF
          </button>
        </div>
      </div>

      {/* ===== DELIVERIES TABLE ===== */}
      <SectionLoading loading={deliveriesLoading} label="Loading deliveries..." minHeight="280px">
        <DeliveryTable
          deliveries={deliveries}
          selectedFilter={activeFilter}
          showActions={true}
          searchQuery={searchQuery}
          onViewDetails={setSelectedDelivery}
          onDataChange={(data) => { tableDataRef.current = data; }}
        />
      </SectionLoading>

      {deliveriesError && (
        <div className="form-submit-error-banner" style={{ marginTop: '16px' }}>
          <FaExclamationCircle size={16} />
          <span>{deliveriesError}</span>
        </div>
      )}

      {/* ===== PAGINATION FOOTER ===== */}
      <div className="deliveries-pagination-footer">
        <p className="pagination-info">
          {t('showingDeliveries') || `Showing ${deliveries.length} deliveries in total`}
        </p>
        <div className="pagination-controls">
          <button type="button" className="dashboard-btn-outline btn-sm" disabled>Previous</button>
          <button type="button" className="dashboard-btn-primary btn-sm" style={{ minWidth: '36px' }}>1</button>
          <button type="button" className="dashboard-btn-outline btn-sm">2</button>
          <button type="button" className="dashboard-btn-outline btn-sm">3</button>
          <button type="button" className="dashboard-btn-outline btn-sm">Next</button>
        </div>
      </div>

      <DeliveryDetailModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        role="admin"
      />
    </MainLayout>
  );
};

export default AdminDeliveries;


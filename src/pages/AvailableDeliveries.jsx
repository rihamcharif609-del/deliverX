import React, { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { 
  FaMapMarkerAlt, 
  FaWeightHanging, 
  FaRoute, 
  FaClock, 
  FaCheckCircle, 
  FaBox, 
  FaBoxes, 
  FaMotorcycle, 
  FaFileAlt 
} from 'react-icons/fa';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const AvailableDeliveries = ({ navigateTo }) => {
  const { t } = useLanguage();
  const { deliveries, deliveriesError, deliveriesLoading, acceptDelivery, acceptingDeliveryId, fetchDeliveries } = useDelivery();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');
  const [acceptError, setAcceptError] = useState('');

  useEffect(() => {
    fetchDeliveries('available').catch(() => {});
  }, [fetchDeliveries]);

  const mappedDeliveries = deliveries.map(d => ({
    ...d,
    distance: d.distanceKm ? `${d.distanceKm} km` : 'N/A',
    estimatedTime: d.time || 'N/A',
    pickupCode: d.id,
  }));

  const filteredDeliveries = mappedDeliveries.filter(delivery => {
    if (filter === 'all') return true;
    const isDoc = (delivery.packageType || '').toLowerCase() === 'documents' || parseFloat(delivery.weight) < 1;
    if (filter === 'documents') return isDoc;
    if (filter === 'parcel') return !isDoc;
    return true;
  });

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    if (sortBy === 'distance') {
      return (parseFloat(a.distance) || 0) - (parseFloat(b.distance) || 0);
    }
    if (sortBy === 'price') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const handleAcceptDelivery = async (deliveryId) => {
    setAcceptError('');
    try {
      await acceptDelivery(deliveryId);
      navigate('/courier/deliveries');
    } catch {
      setAcceptError('Could not accept this delivery. Please try again.');
    }
  };

  const getPackageBadge = (packageType) => {
    const isDoc = (packageType || '').toLowerCase() === 'documents';
    return (
      <span style={{
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '11px',
        fontWeight: '700',
        backgroundColor: isDoc ? 'rgba(59, 130, 246, 0.12)' : 'rgba(16, 185, 129, 0.12)',
        color: isDoc ? '#2563eb' : '#10b981',
        border: `1px solid ${isDoc ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: isDoc ? '#2563eb' : '#10b981'
        }} />
        {packageType || 'Parcel'}
      </span>
    );
  };

  const allCount = mappedDeliveries.length;
  const docsCount = mappedDeliveries.filter(d => (d.packageType || '').toLowerCase() === 'documents' || parseFloat(d.weight) < 1).length;
  const parcelsCount = mappedDeliveries.filter(d => (d.packageType || '').toLowerCase() !== 'documents' && parseFloat(d.weight) >= 1).length;

  const filterCards = [
    { key: 'all', label: 'All Packages', count: allCount, icon: <FaBoxes />, color: '#2563eb' },
    { key: 'documents', label: 'Documents (<1 kg)', count: docsCount, icon: <FaFileAlt />, color: '#3b82f6' },
    { key: 'parcel', label: 'Parcels & Cargo', count: parcelsCount, icon: <FaWeightHanging />, color: '#10b981' },
  ];

  return (
    <MainLayout userRole="courier" activePage="available-deliveries" onNavigate={navigateTo}>
      {/* ===== HERO WELCOME BANNER (MATCHING LANDING PAGE HERO) ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaMotorcycle style={{ fontSize: '11px' }} />
            <span>COURIER SHIPMENTS</span>
          </div>
          <h1 className="hero-banner-title">
            Available Deliveries
          </h1>
          <p className="hero-banner-subtitle">
            Browse nearby delivery requests in Morocco, view live routes & payout rates, and accept shipments instantly.
          </p>
        </div>
        <div className="hero-banner-actions">
          <div style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '16px',
            padding: '14px 22px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            backdropFilter: 'blur(8px)'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: 'rgba(37, 99, 235, 0.3)',
              border: '1px solid rgba(96, 165, 250, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa',
              fontSize: '18px'
            }}>
              <FaBox />
            </div>
            <div>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '700', display: 'block' }}>
                Active Requests
              </span>
              <span style={{ fontSize: '22px', fontWeight: '900', color: '#ffffff', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
                {mappedDeliveries.length} Available
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== HORIZONTAL METRIC FILTER CARDS ===== */}
      <div className="delivery-metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
        {filterCards.map((card) => {
          const isActive = filter === card.key;
          return (
            <div
              key={card.key}
              className={`metric-filter-card ${isActive ? 'active' : ''}`}
              onClick={() => setFilter(card.key)}
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

      {/* ===== TOOLBAR (SORT & STATUS) ===== */}
      <div className="deliveries-toolbar" style={{
        background: 'var(--card-background)',
        border: '1px solid var(--border-color)',
        borderRadius: '16px',
        padding: '14px 20px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
          <span>Showing:</span>
          <span style={{ 
            padding: '4px 12px', 
            borderRadius: '999px', 
            backgroundColor: 'rgba(37, 99, 235, 0.1)', 
            color: '#2563eb', 
            fontWeight: '700',
            border: '1px solid rgba(37, 99, 235, 0.25)',
            fontSize: '12px'
          }}>
            {filter === 'all' ? 'All Deliveries' : filter === 'documents' ? 'Documents Only' : 'Parcels Only'}
          </span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px', marginLeft: '6px' }}>
            ({sortedDeliveries.length} order{sortedDeliveries.length !== 1 ? 's' : ''})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Sort by:</label>
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="form-control"
            style={{
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              width: 'auto'
            }}
          >
            <option value="distance">Closest first</option>
            <option value="price">Highest paying</option>
          </select>
        </div>
      </div>

      {/* ===== AVAILABLE SHIPMENT CARDS GRID ===== */}
      <SectionLoading loading={deliveriesLoading} label="Loading available deliveries..." minHeight="320px">
        {deliveriesError && (
          <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
            <span>⚠️ {deliveriesError}</span>
          </div>
        )}
        {acceptError && (
          <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
            <span>⚠️ {acceptError}</span>
          </div>
        )}

        <div className="available-deliveries-grid">
          {sortedDeliveries.map((delivery) => (
            <div key={delivery.id} className="available-delivery-card">
              <div>
                <div className="available-card-header">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="cell-id" style={{ fontSize: '15px' }}>{delivery.id}</span>
                    {getPackageBadge(delivery.packageType)}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: '900',
                      color: '#10b981',
                      fontVariantNumeric: 'tabular-nums',
                      letterSpacing: '-0.5px'
                    }}>
                      {delivery.amount} MAD
                    </span>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payout Rate
                    </span>
                  </div>
                </div>
                
                <div className="available-route-container">
                  <div className="available-route-point">
                    <div className="available-route-icon pickup">
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Pickup Location
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {delivery.pickup}
                      </span>
                    </div>
                  </div>
                  
                  <div className="available-route-point">
                    <div className="available-route-icon dropoff">
                      <FaMapMarkerAlt />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ display: 'block', fontSize: '11px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        Delivery Destination
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                        {delivery.destination}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="available-meta-strip">
                  <div className="available-meta-item">
                    <FaRoute style={{ color: '#2563eb' }} />
                    <span>{delivery.distance}</span>
                  </div>
                  <div className="available-meta-item">
                    <FaClock style={{ color: '#f59e0b' }} />
                    <span>{delivery.estimatedTime}</span>
                  </div>
                  <div className="available-meta-item">
                    <FaWeightHanging style={{ color: '#8b5cf6' }} />
                    <span>{delivery.weight}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="dashboard-btn-primary"
                onClick={() => handleAcceptDelivery(delivery.id)}
                disabled={acceptingDeliveryId === delivery.id}
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '12px',
                  fontWeight: '700'
                }}
              >
                {acceptingDeliveryId === delivery.id ? (
                  <LoadingSpinner inline label="Accepting..." size={14} />
                ) : (
                  <>
                    <FaCheckCircle size={15} /> Accept Delivery
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {sortedDeliveries.length === 0 && (
          <div className="available-empty-state">
            <div className="available-empty-icon">
              <FaBox />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-primary)' }}>
              No deliveries available
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', maxWidth: '420px', margin: '0 auto', lineHeight: '1.6' }}>
              There are no waiting packages for this filter in Morocco currently. Check back soon or switch filters to see other orders!
            </p>
          </div>
        )}
      </SectionLoading>
    </MainLayout>
  );
};

export default AvailableDeliveries;


import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { FaMapMarkerAlt, FaWeightHanging, FaRoute, FaClock, FaCheckCircle, FaBox } from 'react-icons/fa';

const AvailableDeliveries = () => {
  const { t } = useLanguage();
  const { deliveries, acceptDelivery } = useDelivery();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('distance');

  // Filter deliveries that are waiting for a courier
  const availableRequests = deliveries.filter(d => d.status === 'waiting-courier');

  // Map context deliveries to list view with simulated meta for nicer UI
  const mappedDeliveries = availableRequests.map(d => {
    // Generate some mock/simulated distance and duration for the premium UI
    const randomDistance = (2.0 + Math.random() * 8.5).toFixed(1);
    const estDuration = Math.round(randomDistance * 6 + 5);

    return {
      ...d,
      distance: `${randomDistance} km`,
      estimatedTime: `${estDuration} min`,
      pickupCode: 'P-' + d.id.split('-')[1]
    };
  });

  const filteredDeliveries = mappedDeliveries.filter(delivery => {
    if (filter === 'all') return true;
    const isDoc = (delivery.packageType || '').toLowerCase() === 'documents' || parseFloat(delivery.weight) < 1;
    if (filter === 'documents') return isDoc;
    if (filter === 'parcel') return !isDoc;
    return true;
  });

  const sortedDeliveries = [...filteredDeliveries].sort((a, b) => {
    if (sortBy === 'distance') {
      return parseFloat(a.distance) - parseFloat(b.distance);
    }
    if (sortBy === 'price') {
      return b.amount - a.amount;
    }
    return 0;
  });

  const handleAcceptDelivery = (deliveryId) => {
    acceptDelivery(deliveryId, 'Mike Smith');
    // Navigate to courier deliveries page
    navigate('/courier/deliveries');
  };

  const getPackageBadge = (packageType) => {
    const isDoc = (packageType || '').toLowerCase() === 'documents';
    return (
      <span style={{
        padding: '4px 8px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '600',
        backgroundColor: isDoc ? 'rgba(59, 130, 246, 0.15)' : 'rgba(16, 185, 129, 0.15)',
        color: isDoc ? '#3b82f6' : '#10b981',
        border: `1px solid ${isDoc ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
      }}>
        {packageType || 'Parcel'}
      </span>
    );
  };

  return (
    <MainLayout userRole="courier" activePage="available-deliveries">
      <div className="page-container">
        <div className="page-header" style={{ marginBottom: '24px' }}>
          <div>
            <h1 className="page-title">{t('available') || 'Available Deliveries'}</h1>
            <p className="page-subtitle">{t('availableDesc') || 'Accept nearby orders and start delivering in Morocco.'}</p>
          </div>
          <div className="header-stats" style={{ display: 'flex', gap: '12px' }}>
            <div className="stat-badge" style={{
              background: 'var(--card-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span className="stat-label" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Available</span>
              <span className="stat-value" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{mappedDeliveries.length}</span>
            </div>
            <div className="stat-badge" style={{
              background: 'var(--card-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <span className="stat-label" style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Active City</span>
              <span className="stat-value" style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>Casablanca</span>
            </div>
          </div>
        </div>

        <div className="filters-section" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '24px',
          background: 'var(--card-background)',
          padding: '16px',
          borderRadius: '16px',
          border: '1px solid var(--border-color)'
        }}>
          <div className="filter-tabs" style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filter === 'all' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                color: filter === 'all' ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              All Types
            </button>
            <button 
              className={`filter-tab ${filter === 'documents' ? 'active' : ''}`}
              onClick={() => setFilter('documents')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filter === 'documents' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                color: filter === 'documents' ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Documents
            </button>
            <button 
              className={`filter-tab ${filter === 'parcel' ? 'active' : ''}`}
              onClick={() => setFilter('parcel')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                background: filter === 'parcel' ? '#2563eb' : 'rgba(255,255,255,0.05)',
                color: filter === 'parcel' ? '#fff' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Parcels
            </button>
          </div>
          
          <div className="sort-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sort by:</label>
            <select 
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                background: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              <option value="distance">Closest first</option>
              <option value="price">Highest paying</option>
            </select>
          </div>
        </div>

        <div className="deliveries-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {sortedDeliveries.map((delivery) => (
            <div key={delivery.id} className="delivery-card" style={{
              background: 'var(--card-background)',
              border: '1px solid var(--border-color)',
              borderRadius: '20px',
              padding: '24px',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              <div>
                <div className="delivery-card-header" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="delivery-id" style={{
                      fontWeight: '700',
                      color: 'var(--text-primary)',
                      fontSize: '15px'
                    }}>{delivery.id}</span>
                    {getPackageBadge(delivery.packageType)}
                  </div>
                  <span className="delivery-price" style={{
                    fontSize: '18px',
                    fontWeight: '800',
                    color: '#10b981'
                  }}>{delivery.amount} MAD</span>
                </div>
                
                <div className="delivery-locations" style={{
                  borderTop: '1px solid var(--border-color)',
                  borderBottom: '1px solid var(--border-color)',
                  padding: '16px 0',
                  margin: '16px 0'
                }}>
                  <div className="location-item" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ color: '#2563eb', marginTop: '3px' }}><FaMapMarkerAlt /></div>
                    <div className="location-details">
                      <span className="location-label" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Pickup</span>
                      <span className="location-address" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{delivery.pickup}</span>
                    </div>
                  </div>
                  
                  <div className="location-item" style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ color: '#10b981', marginTop: '3px' }}><FaMapMarkerAlt /></div>
                    <div className="location-details">
                      <span className="location-label" style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Dropoff</span>
                      <span className="location-address" style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>{delivery.destination}</span>
                    </div>
                  </div>
                </div>
                
                <div className="delivery-meta" style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '12px',
                  borderRadius: '12px'
                }}>
                  <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FaRoute style={{ color: '#2563eb' }} />
                    <span>{delivery.distance}</span>
                  </div>
                  <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FaClock style={{ color: '#eab308' }} />
                    <span>{delivery.estimatedTime}</span>
                  </div>
                  <div className="meta-item" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FaWeightHanging style={{ color: '#8b5cf6' }} />
                    <span>{delivery.weight}</span>
                  </div>
                </div>
              </div>
              
              <button 
                className="btn btn-primary accept-btn"
                onClick={() => handleAcceptDelivery(delivery.id)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: '#2563eb',
                  color: '#fff',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background-color 0.2s'
                }}
              >
                <FaCheckCircle /> Accept Delivery
              </button>
            </div>
          ))}
        </div>

        {sortedDeliveries.length === 0 && (
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--card-background)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)',
            marginTop: '20px'
          }}>
            <div className="empty-icon" style={{ fontSize: '48px', marginBottom: '16px' }}><FaBox style={{ color: 'var(--text-secondary)' }} /></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: 'var(--text-primary)' }}>No deliveries available</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Check back later or switch roles to create a new delivery request!</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AvailableDeliveries;
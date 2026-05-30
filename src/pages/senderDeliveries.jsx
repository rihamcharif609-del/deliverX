import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import MainLayout from '../layouts/MainLayout';
import SenderDeliveryTable from '../components/SenderDeliveryTable';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const SenderDeliveries = ({ userRole }) => {
  const { t } = useLanguage();
  const { deliveries, deliveriesError, deliveriesLoading, fetchDeliveries } = useDelivery();
  const filters = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

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

  return (
    <MainLayout userRole="sender" activePage="sender-deliveries">
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('myDeliveries') || 'My Deliveries'}</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your Moroccan package delivery requests and payments</p>
        </div>
        {userRole === 'sender' && (
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/sender/create')}
            style={{ 
              whiteSpace: 'nowrap', 
              padding: '12px 24px', 
              borderRadius: '12px',
              backgroundColor: '#2563eb',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' 
            }}
          >
            + New Delivery Request
          </button>
        )}
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px',
                fontWeight: '600',
                background: activeFilter === filter ? '#2563eb' : 'transparent',
                borderColor: activeFilter === filter ? '#2563eb' : 'var(--border-color)',
                color: activeFilter === filter ? '#fff' : 'var(--text-secondary)',
                transition: 'all 0.2s'
              }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div className="search-box" style={{ margin: 0, width: '250px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder={t('searchPlaceholder') || 'Search ID, cities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{
                background: 'var(--card-background)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>
      </div>

      <SectionLoading loading={deliveriesLoading} label="Loading deliveries..." minHeight="280px">
      <SenderDeliveryTable  
        deliveries={deliveries}
        selectedFilter={activeFilter} 
        searchQuery={searchQuery}
        onPayClick={handleOpenPayment}
      />
      </SectionLoading>
      {deliveriesError && (
        <p style={{ marginTop: '16px', color: '#ef4444' }}>{deliveriesError}</p>
      )}

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          Showing {deliveries.length} delivery requests in total
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" disabled style={{ borderRadius: '8px', padding: '6px 12px' }}>Previous</button>
          <button className="btn btn-primary" style={{ borderRadius: '8px', padding: '6px 12px', background: '#2563eb' }}>1</button>
          <button className="btn btn-outline" style={{ borderRadius: '8px', padding: '6px 12px' }}>Next</button>
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

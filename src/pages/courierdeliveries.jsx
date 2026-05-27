import { useLanguage } from '../context/LanguageContext';
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import { useDelivery } from '../context/DeliveryContext';
import { useEffect } from 'react';
import CourierDeliveryTable from '../components/CourierDeliveryTable';
import DeliveryDetailModal from '../components/DeliveryDetailModal';


const CourierDeliveries = ({ navigateTo, userRole }) => {
  const { t } = useLanguage();
  const filters = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [searchQuery] = React.useState('');
const [selectedDelivery, setSelectedDelivery] = React.useState(null);
  const { deliveriesError, deliveriesLoading, fetchDeliveries } = useDelivery();

  useEffect(() => {
    fetchDeliveries('courier').catch(() => {});
  }, [fetchDeliveries]);
    

  return (
    <MainLayout userRole={userRole} activePage="courier-deliveries" onNavigate={navigateTo} 
  >
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('myDeliveries')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your active and completed deliveries</p>
      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          {filters.map((filter) => (
            <button
              key={filter}
              className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '8px 16px' }}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
    
      </div>

<CourierDeliveryTable 
  selectedFilter={activeFilter}
  searchQuery={searchQuery}
  showActions={false} 
  onViewDetails={setSelectedDelivery}
/>
      {deliveriesLoading && (
        <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Loading deliveries...</p>
      )}
      {deliveriesError && (
        <p style={{ marginTop: '16px', color: '#ef4444' }}>{deliveriesError}</p>
      )}

      <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>{t('showingDeliveries')}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" disabled>Previous</button>
          <button className="btn btn-primary">1</button>
          <button className="btn btn-outline">2</button>
          <button className="btn btn-outline">3</button>
          <button className="btn btn-outline">Next</button>
        </div>
      </div>

      <DeliveryDetailModal
        delivery={selectedDelivery}
        onClose={() => setSelectedDelivery(null)}
        role="courier"
      />
    </MainLayout>
  );
};

export default CourierDeliveries;

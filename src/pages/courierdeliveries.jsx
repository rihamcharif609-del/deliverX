import { useLanguage } from '../context/LanguageContext';
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import { useEffect } from 'react';
import CourierDeliveryTable from '../components/CourierDeliveryTable';
import DeliveryDetailModal from '../components/DeliveryDetailModal';


const CourierDeliveries = ({ navigateTo, setUserRole, userRole }) => {
  const { t } = useLanguage();
  const filters = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];
  const [activeFilter, setActiveFilter] = React.useState('All');
  const [searchQuery, setSearchQuery] = React.useState('');
const [selectedDelivery, setSelectedDelivery] = React.useState(null);


    

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
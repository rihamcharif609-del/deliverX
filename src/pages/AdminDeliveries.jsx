import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import DeliveryTable from '../components/DeliveryTable';
import DeliveryDetailModal from '../components/DeliveryDetailModal';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AdminDeliveries = ({ setUserRole, userRole }) => {
  const { t } = useLanguage();
  const { deliveries, deliveriesError, deliveriesLoading, fetchDeliveries } = useDelivery();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const tableDataRef = useRef([]);

  const filters = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

  useEffect(() => {
    fetchDeliveries('admin').catch(() => {});
  }, [fetchDeliveries]);

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
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('allDeliveries')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('allDeliveriesDesc')}</p>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary" onClick={handleExportPDF}>
            {t('exportPDF')}
          </button>
        </div>

        

      </div>

      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <div style={{ flex: 1, maxWidth: '300px' }}>
          <div className="search-box">
           <span className="search-icon">🔍</span>
           <input
           className="search-input"
            type="text"
            placeholder={t('searchCustomer')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            
          />
          </div>
        </div>

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
      <DeliveryTable
        deliveries={deliveries}
        selectedFilter={activeFilter}
        showActions={true}
        searchQuery={searchQuery}
        onViewDetails={setSelectedDelivery}
        onDataChange={(data) => { tableDataRef.current = data; }}
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
        role="admin"
      />
    </MainLayout>
  );
};

export default AdminDeliveries;

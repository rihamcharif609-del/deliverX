import { useLanguage } from '../context/LanguageContext';
import React from 'react';
import MainLayout from '../layouts/MainLayout';
import DeliveryTable from '../components/DeliveryTable';
import StatusBadge from '../components/StatusBadge';
import { useState } from 'react';
import AdminDeliveryDetail from '../components/adminDeliveryDetail';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';




const AdminDeliveries = ({ navigateTo, setUserRole, userRole }) => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [tableData, setTableData] = useState([]);
  const tableRef = useRef([]);

  const filters = ['All', 'Pending', 'In Transit', 'Delivered', 'Cancelled'];

  const handleExportPDF = () => {
  const doc = new jsPDF();

  const tableColumn = [
    "Order ID",
    "Customer",
    "Courier",
    "Date",
    "Status",
    "Total"
  ];

  const tableRows = [];

  

  <DeliveryTable 
  selectedFilter={activeFilter}
  searchQuery={searchQuery}
  showActions={true}
  onDataChange={(data) => {
    setTableData(data);
    tableRef.current = data;
  }}
/>


  tableRef.current.forEach(d => {
    const row = [
      d.id,
      d.customer,
      d.Courier,
      d.date,
      d.status,
      `$${d.total}`
    ];
    tableRows.push(row);
  });

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
  });

  window.open(doc.output('bloburl'));


};



  return (
    <MainLayout userRole={userRole} activePage="admin-deliveries" onNavigate={navigateTo} 
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
      <DeliveryTable selectedFilter={activeFilter} showActions={true} searchQuery={searchQuery} onViewDetails={setSelectedDelivery}/>

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
      <AdminDeliveryDetail 
  delivery={selectedDelivery} 
  onClose={() => setSelectedDelivery(null)} 
/>
    </MainLayout>
  );
};

export default AdminDeliveries;
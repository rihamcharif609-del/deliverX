import React, { useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';

const DeliveryTable = ({ deliveries = [], showActions = false, selectedFilter = 'All', searchQuery = '', onViewDetails, onDataChange }) => {
  const defaultDeliveries = [
    { id: 'DEL001', customer: 'John Smith', Courier: 'Mike Smith', status: 'pending', date: '2024-03-14', total: 45.99 ,
      phone: '0612345678',address: '123 Main Street, NY',
      items: [
        { name: 'document', qty: 1 },
        { name: 'colia', qty: 1 }],
        paymentMethod: 'Cash',
        notes: 'Call before arrival',
        timeline: [
  { step: 'Pending', date: '2024-03-14 10:00' },
  { step: 'Picked Up', date: '2024-03-14 10:30' },
  { step: 'In Transit', date: '2024-03-14 11:00' }
]

     },
    { id: 'DEL002', customer: 'Sarah Johnson', Courier: 'Emma Brown', status: 'in-transit', date: '2024-03-14', total: 78.50 ,
      phone: '0612345678',address: '123 Main Street, NY',
      items: [
        { name: 'Pizza', qty: 2 },
        { name: 'Coke', qty: 1 }],
        paymentMethod: 'Cash',
        notes: 'Call before arrival',
        timeline: [
  { step: 'Pending', date: '2024-03-14 10:00' },
  { step: 'Picked Up', date: '2024-03-14 10:30' },
  { step: 'In Transit', date: '2024-03-14 11:00' }
]

     },
    { id: 'DEL003', customer: 'Mike Wilson', Courier: 'Mike Smith', status: 'delivered', date: '2024-03-13', total: 120.00,
      phone: '0612345678',address: '123 Main Street, NY',
      items: [
        { name: 'Pizza', qty: 2 },
        { name: 'Coke', qty: 1 }],
        paymentMethod: 'Cash',
        notes: 'Call before arrival',
        timeline: [
  { step: 'Pending', date: '2024-03-14 10:00' },
  { step: 'Picked Up', date: '2024-03-14 10:30' },
  { step: 'In Transit', date: '2024-03-14 11:00' }
]

     },
    { id: 'DEL004', customer: 'Emily Brown', Courier: 'David Lee', status: 'pending', date: '2024-03-14', total: 32.75,
      phone: '0612345678',address: '123 Main Street, NY',
      items: [
        { name: 'Pizza', qty: 2 },
        { name: 'Coke', qty: 1 }],
        paymentMethod: 'Cash',
        notes: 'Call before arrival',
        timeline: [
  { step: 'Pending', date: '2024-03-14 10:00' },
  { step: 'Picked Up', date: '2024-03-14 10:30' },
  { step: 'In Transit', date: '2024-03-14 11:00' }
]

     },
    { id: 'DEL005', customer: 'David Lee', Courier: 'Emma Brown', status: 'in-transit', date: '2024-03-14', total: 95.25 ,
      phone: '0612345678',address: '123 Main Street, NY',
      items: [
        { name: 'Pizza', qty: 2 },
        { name: 'Coke', qty: 1 }],
        paymentMethod: 'Cash',
        notes: 'Call before arrival',
        timeline: [
  { step: 'Pending', date: '2024-03-14 10:00' },
  { step: 'Picked Up', date: '2024-03-14 10:30' },
  { step: 'In Transit', date: '2024-03-14 11:00' }
]

    },
  ];

  const data = deliveries.length > 0 ? deliveries : defaultDeliveries;

  const filterKey = selectedFilter.toLowerCase().replace(' ', '-');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = filterKey === 'all' || item.status === filterKey;
      const matchesSearch = (item.customer || '')
        .toLowerCase()
        .includes((searchQuery || '').toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [data, filterKey, searchQuery]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(filteredData);
    }
  }, [filteredData, onDataChange]);

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Courier</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            {showActions && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((delivery) => (
            <tr key={delivery.id}>
              <td>{delivery.id}</td>
              <td>{delivery.customer || 'John Sender'}</td>
              <td>{delivery.Courier || delivery.courier || 'Unassigned'}</td>
              <td>{delivery.date}</td>
              <td><StatusBadge status={delivery.status} /></td>
              <td>{(delivery.total || delivery.amount || 0).toFixed(2)} MAD</td>
              {showActions && (
                <td>
                  <button className="btn btn-outline" 
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                  onClick={() => {
                    if (onViewDetails) onViewDetails(delivery);
                    }}>
                    View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
          No deliveries found for "{selectedFilter}"
        </p>
        )}
    </div>
  );
};

export default DeliveryTable;
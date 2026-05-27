import React, { useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';

const DeliveryTable = ({ deliveries = [], showActions = false, selectedFilter = 'All', searchQuery = '', onViewDetails, onDataChange }) => {
  const data = deliveries;

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

import React, { useEffect, useMemo } from 'react';
import StatusBadge from './StatusBadge';

const DeliveryTable = ({ deliveries = [], showActions = false, selectedFilter = 'All', searchQuery = '', onViewDetails, onDataChange }) => {
  const data = deliveries;

  const filterKey = selectedFilter.toLowerCase().replace(' ', '-');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesStatus = 
        filterKey === 'all' || 
        item.status === filterKey ||
        (filterKey === 'pending' && ['pending', 'accepted', 'waiting-courier', 'paid'].includes(item.status)) ||
        (filterKey === 'in-transit' && ['in-transit', 'picked-up'].includes(item.status));
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch = 
        !q ||
        (item.customer || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q) ||
        (item.Courier || item.courier || '').toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [data, filterKey, searchQuery]);

  useEffect(() => {
    if (onDataChange) {
      onDataChange(filteredData);
    }
  }, [filteredData, onDataChange]);

  return (
    <div className="table-container dashboard-table-card">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Courier</th>
            <th>Date</th>
            <th>Status</th>
            <th>Total</th>
            {showActions && <th style={{ textAlign: 'center' }}>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredData.map((delivery) => (
            <tr key={delivery.id} className="table-row-hover">
              <td className="cell-id">{delivery.id}</td>
              <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                {delivery.customer || 'John Sender'}
              </td>
              <td style={{ color: 'var(--text-secondary)' }}>
                {delivery.Courier || delivery.courier || 'Unassigned'}
              </td>
              <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {delivery.date || 'Recent'}
              </td>
              <td><StatusBadge status={delivery.status} /></td>
              <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                {(delivery.total || delivery.amount || 0).toFixed(2)} MAD
              </td>
              {showActions && (
                <td style={{ textAlign: 'center' }}>
                  <button 
                    type="button"
                    className="dashboard-btn-outline btn-sm" 
                    style={{ padding: '4px 12px', fontSize: '12px', width: 'auto' }}
                    onClick={() => {
                      if (onViewDetails) onViewDetails(delivery);
                    }}
                  >
                    View
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {filteredData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 20px', color: 'var(--text-secondary)' }}>
          No deliveries found for "{selectedFilter}"
        </div>
      )}
    </div>
  );
};

export default DeliveryTable;

import React from 'react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaChevronRight } from 'react-icons/fa';

const SenderDeliveryTable = ({
  deliveries = [],
  selectedFilter = 'All',
  searchQuery = '',
  onPayClick,
  limit,
  showActions = true,
}) => {

  const filteredData = deliveries.filter((d) => {
    // Map custom filters to status keys
    let mappedFilter = selectedFilter.toLowerCase();

    const matchesSearch = !searchQuery ||
                          d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          d.to.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (mappedFilter === 'pending') {
      // Waiting for courier or accepted but unpaid are both pending payments or pickups
      return d.status === 'waiting-courier' || d.status === 'accepted' || d.status === 'paid';
    }
    if (mappedFilter === 'in transit') {
      return d.status === 'picked-up' || d.status === 'in-transit';
    }
    if (mappedFilter === 'delivered') {
      return d.status === 'delivered';
    }
    if (mappedFilter === 'cancelled') {
      return d.status === 'cancelled';
    }
    
    return true; // All
  });

  const visibleData = typeof limit === 'number' ? filteredData.slice(0, limit) : filteredData;
  const columnCount = showActions ? 8 : 7;
  const navigate = useNavigate();
  return (
    <div className="table-container" style={{
      background: 'var(--card-background)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>ID</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Route</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Package Info</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Courier</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Date & Time</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Status</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Amount</th>
            {showActions && (
              <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
            )}
          </tr>
        </thead>

        <tbody>
          {visibleData.length === 0 ? (
            <tr>
              <td colSpan={columnCount} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No deliveries found.
              </td>
            </tr>
          ) : (
            visibleData.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                
                {/* ID */}
                <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{d.id}</td>

                {/* Route */}
                <td style={{ padding: '16px' }}>
                  <div>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
                      <strong style={{ color: '#2563eb' }}>From:</strong> {d.pickup || d.from}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      <strong style={{ color: '#10b981' }}>To:</strong> {d.destination || d.to}
                    </p>
                  </div>
                </td>

                {/* Package */}
                <td style={{ padding: '16px' }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '500' }}>{d.packageType || d.type}</p>
                  <p style={{ margin: 0, color: 'gray', fontSize: '11px' }}>{d.weight}</p>
                </td>

                {/* Courier */}
                <td style={{ padding: '16px' }}>
                  {d.courier ? (
                    <>
                      <p style={{ margin: '0 0 2px 0', fontWeight: '500' }}>{d.courier}</p>
                      <p style={{ margin: 0, color: 'gray', fontSize: '11px' }}>{d.courierPhone || d.phone}</p>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px' }}>Waiting for Courier</span>
                  )}
                </td>

                {/* Date */}
                <td style={{ padding: '16px' }}>
                  <p style={{ margin: '0 0 2px 0', fontWeight: '500' }}>{d.date}</p>
                  <p style={{ margin: 0, color: 'gray', fontSize: '11px' }}>{d.time}</p>
                </td>

                {/* Status */}
                <td style={{ padding: '16px' }}>
                  <StatusBadge status={d.status} />
                </td>

                {/* Amount */}
                <td style={{ padding: '16px', fontWeight: '700', color: '#10b981' }}>
                  {d.amount} MAD
                </td>

                {showActions && (
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                      {d.status === 'accepted' && (
                        <button 
                          className="btn btn-primary"
                          onClick={() => onPayClick && onPayClick(d)}
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px', 
                            backgroundColor: '#ef4444', 
                            borderColor: '#ef4444',
                            color: '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          <FaCreditCard size={12} /> Pay Now
                        </button>
                      )}
                      <button 
                        className="btn btn-outline"
                        onClick={() => navigate(`/sender/tracking/${d.id}`)}
                        style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        Track <FaChevronRight size={10} />
                      </button>
                    </div>
                  </td>
                )}

              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default SenderDeliveryTable;

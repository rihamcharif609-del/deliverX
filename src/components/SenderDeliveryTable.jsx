import React from 'react';
import StatusBadge from './StatusBadge';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaChevronRight, FaMapMarkerAlt, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

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
    <div className="table-container dashboard-table-card">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Route</th>
            <th>Package</th>
            <th>Courier</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Amount</th>
            {showActions && <th style={{ textAlign: 'center' }}>Actions</th>}
          </tr>
        </thead>

        <tbody>
          {visibleData.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="empty-table-cell">
                No deliveries found.
              </td>
            </tr>
          ) : (
            visibleData.map((d) => (
              <tr key={d.id} className="table-row-hover">
                
                {/* ID */}
                <td className="cell-id">{d.id}</td>

                {/* Route */}
                <td>
                  <div className="route-cell">
                    <div className="route-from">
                      <span className="route-dot from-dot" />
                      <span className="route-text">{d.pickup || d.from}</span>
                    </div>
                    <div className="route-to">
                      <span className="route-dot to-dot" />
                      <span className="route-text">{d.destination || d.to}</span>
                    </div>
                  </div>
                </td>

                {/* Package */}
                <td>
                  <div className="package-cell">
                    <span className="package-title">{d.packageType || d.type || 'Standard Package'}</span>
                    <span className="package-weight">{d.weight || 'N/A'}</span>
                  </div>
                </td>

                {/* Courier */}
                <td>
                  {d.courier ? (
                    <div className="courier-cell">
                      <span className="courier-name">{d.courier}</span>
                      <span className="courier-phone">{d.courierPhone || d.phone}</span>
                    </div>
                  ) : (
                    <span className="waiting-courier-tag">Waiting for Courier</span>
                  )}
                </td>

                {/* Date */}
                <td>
                  <div className="date-cell">
                    <span className="date-main">{d.date}</span>
                    <span className="date-time">{d.time}</span>
                  </div>
                </td>

                {/* Status */}
                <td>
                  <StatusBadge status={d.status} />
                </td>

                {/* Amount */}
                <td>
                  <span className="amount-value">{d.amount} MAD</span>
                </td>

                {showActions && (
                  <td>
                    <div className="actions-cell">
                      {d.status === 'accepted' && (
                        <button 
                          className="pay-now-btn"
                          onClick={() => onPayClick && onPayClick(d)}
                        >
                          <FaCreditCard size={11} /> Pay Now
                        </button>
                      )}
                      <button 
                        className="track-btn"
                        onClick={() => navigate(`/sender/tracking/${d.id}`)}
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

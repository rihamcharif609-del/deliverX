import React from 'react';

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: 'Pending',
    'waiting-courier': 'Waiting Courier',
    accepted: 'Accepted',
    paid: 'Paid',
    'picked-up': 'Picked Up',
    'in-transit': 'In Transit',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  const normalizedStatus = status ? status.toLowerCase() : 'pending';

  return (
    <span className={`status-badge status-${normalizedStatus}`}>
      <span className="status-badge-dot" />
      {statusMap[status] || status}
    </span>
  );
};

export default StatusBadge;
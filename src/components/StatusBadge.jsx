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

  return (
    <span className={`status-badge ${status}`}>
      {statusMap[status] || status}
    </span>
  );
};

export default StatusBadge;
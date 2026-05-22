import React from 'react';

const StatusBadge = ({ status }) => {
  const statusMap = {
    pending: 'Pending',
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
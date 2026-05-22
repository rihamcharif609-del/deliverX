import React from 'react';

const StatCard = ({ title, value, change, icon, trend = 'positive' }) => {
  return (
    <div className="stat-card">
      <div className="stat-info">
        <h3>{title}</h3>
        <div className="stat-number">{value}</div>
        <div className={`stat-change ${trend}`}>
          {trend === 'positive' ? '↑' : '↓'} {change}
        </div>
      </div>
      <div className="stat-icon">{icon}</div>
    </div>
  );
};

export default StatCard;
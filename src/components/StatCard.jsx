import React from 'react';
import { FaBox, FaTruck, FaCheckCircle, FaWallet } from 'react-icons/fa';

const iconConfigMap = {
  DX: { icon: <FaBox />, bg: 'linear-gradient(135deg, #2563eb, #3b82f6)', color: '#ffffff' },
  TR: { icon: <FaTruck />, bg: 'linear-gradient(135deg, #f59e0b, #fbbf24)', color: '#ffffff' },
  OK: { icon: <FaCheckCircle />, bg: 'linear-gradient(135deg, #10b981, #34d399)', color: '#ffffff' },
  MAD: { icon: <FaWallet />, bg: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', color: '#ffffff' },
};

const StatCard = ({ title, value, change, icon, trend = 'positive' }) => {
  const config = iconConfigMap[icon] || {
    icon: typeof icon === 'string' ? icon : icon,
    bg: 'linear-gradient(135deg, #2563eb, #3b82f6)',
    color: '#ffffff',
  };

  return (
    <div className="stat-card">
      <div className="stat-info">
        <span className="stat-title">{title}</span>
        <div className="stat-number">{value}</div>
        <div className={`stat-change ${trend}`}>
          <span className="stat-change-badge">
            {trend === 'positive' ? '↑' : '↓'} {change}
          </span>
        </div>
      </div>
      <div 
        className="stat-icon-wrapper"
        style={{ background: config.bg, color: config.color }}
      >
        {config.icon}
      </div>
    </div>
  );
};

export default StatCard;
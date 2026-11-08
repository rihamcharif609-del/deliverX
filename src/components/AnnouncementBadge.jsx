/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaTools,
  FaCheckCircle,
  FaFileAlt
} from 'react-icons/fa';

export const getAnnouncementTypeConfig = (type = 'info') => {
  const normalized = String(type || 'info').toLowerCase();
  switch (normalized) {
    case 'warning':
      return {
        label: 'Warning',
        icon: <FaExclamationTriangle size={11} />,
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#d97706',
        border: '1px solid rgba(245, 158, 11, 0.28)',
        dotColor: '#f59e0b',
        solidColor: '#f59e0b',
      };
    case 'important':
      return {
        label: 'Important',
        icon: <FaExclamationCircle size={11} />,
        bg: 'rgba(239, 68, 68, 0.12)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.28)',
        dotColor: '#ef4444',
        solidColor: '#ef4444',
      };
    case 'maintenance':
      return {
        label: 'Maintenance',
        icon: <FaTools size={11} />,
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#8b5cf6',
        border: '1px solid rgba(139, 92, 246, 0.28)',
        dotColor: '#8b5cf6',
        solidColor: '#8b5cf6',
      };
    case 'info':
    default:
      return {
        label: 'Info',
        icon: <FaInfoCircle size={11} />,
        bg: 'rgba(37, 99, 235, 0.12)',
        color: '#2563eb',
        border: '1px solid rgba(37, 99, 235, 0.28)',
        dotColor: '#2563eb',
        solidColor: '#2563eb',
      };
  }
};

export const AnnouncementTypeBadge = ({ type = 'info', showIcon = true, size = 'md' }) => {
  const config = getAnnouncementTypeConfig(type);
  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: '20px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: '700',
        backgroundColor: config.bg,
        color: config.color,
        border: config.border,
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
      }}
    >
      {showIcon && config.icon}
      <span>{config.label}</span>
    </span>
  );
};

export const AnnouncementStatusBadge = ({ isPublished = false, size = 'md' }) => {
  const isSmall = size === 'sm';
  const published = Boolean(isPublished);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 12px',
        borderRadius: '20px',
        fontSize: isSmall ? '11px' : '12px',
        fontWeight: '700',
        backgroundColor: published ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
        color: published ? '#10b981' : '#64748b',
        border: published ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(100, 116, 139, 0.25)',
        textTransform: 'uppercase',
        letterSpacing: '0.4px',
        whiteSpace: 'nowrap',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: published ? '#10b981' : '#64748b',
        }}
      />
      <span>{published ? 'Published' : 'Draft'}</span>
    </span>
  );
};

export default AnnouncementTypeBadge;

/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { 
  FaBullhorn, 
  FaTimes, 
  FaSpinner, 
  FaInfoCircle, 
  FaExclamationTriangle, 
  FaExclamationCircle, 
  FaTools,
  FaCheckCircle
} from 'react-icons/fa';

const typeOptions = [
  {
    value: 'info',
    label: 'Info',
    icon: <FaInfoCircle size={14} />,
    color: '#2563eb',
    desc: 'General platform updates, tips, or informative news',
  },
  {
    value: 'warning',
    label: 'Warning',
    icon: <FaExclamationTriangle size={14} />,
    color: '#f59e0b',
    desc: 'Weather disruptions, courier delays, or operational notices',
  },
  {
    value: 'important',
    label: 'Important',
    icon: <FaExclamationCircle size={14} />,
    color: '#ef4444',
    desc: 'Critical security alerts, urgent compliance, or policy changes',
  },
  {
    value: 'maintenance',
    label: 'Maintenance',
    icon: <FaTools size={14} />,
    color: '#8b5cf6',
    desc: 'Scheduled server downtime, platform upgrades, or system work',
  },
];

const AnnouncementModal = ({
  isOpen,
  announcement = null, // null for create, object for edit
  onClose,
  onSubmit,
  loading = false,
  error = '',
}) => {
  const isEdit = Boolean(announcement && announcement.id);

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title || '');
      setMessage(announcement.message || '');
      setType(String(announcement.type || 'info').toLowerCase());
      setPublishImmediately(Boolean(announcement.is_published));
    } else {
      setTitle('');
      setMessage('');
      setType('info');
      setPublishImmediately(true);
    }
    setValidationError('');
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter an announcement title.');
      return;
    }
    if (title.trim().length < 3) {
      setValidationError('Title must be at least 3 characters long.');
      return;
    }
    if (!message.trim()) {
      setValidationError('Please enter an announcement message.');
      return;
    }
    if (message.trim().length < 5) {
      setValidationError('Message must be at least 5 characters long.');
      return;
    }

    setValidationError('');
    onSubmit({
      id: announcement?.id,
      title: title.trim(),
      message: message.trim(),
      type,
      publish: publishImmediately,
      is_published: publishImmediately,
    });
  };

  const handleClose = () => {
    if (loading) return;
    setValidationError('');
    onClose();
  };

  return (
    <div className="courier-modal-backdrop" onClick={handleClose}>
      <div 
        className="courier-modal-card" 
        style={{ maxWidth: '580px', width: '100%', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={loading}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '6px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close"
        >
          <FaTimes size={16} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'rgba(37, 99, 235, 0.12)',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            <FaBullhorn />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {isEdit ? 'Edit Global Announcement' : 'Create Global Announcement'}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              {isEdit
                ? 'Update announcement content, urgency classification, or publish status'
                : 'Broadcast a notice to all registered senders and couriers across DeliverX'}
            </p>
          </div>
        </div>

        {/* Errors */}
        {(validationError || error) && (
          <div style={{
            marginBottom: '18px',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: '#ef4444',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaExclamationTriangle size={14} style={{ flexShrink: 0 }} />
            <span>{validationError || error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Title Input */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Announcement Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="e.g. Scheduled System Maintenance on Sunday, Weather Advisory..."
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (validationError) setValidationError('');
              }}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-background)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: '500',
                outline: 'none'
              }}
              disabled={loading}
              required
            />
          </div>

          {/* Type Selection */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              Urgency & Type <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px'
            }}>
              {typeOptions.map((opt) => {
                const isSelected = type === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setType(opt.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-color)',
                      background: isSelected ? `${opt.color}10` : 'var(--card-background)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      outline: 'none',
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: '700',
                        fontSize: '13px',
                        color: isSelected ? opt.color : 'var(--text-primary)'
                      }}>
                        <span style={{ color: opt.color }}>{opt.icon}</span>
                        {opt.label}
                      </span>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: isSelected ? `4px solid ${opt.color}` : '2px solid var(--border-color)',
                        background: 'transparent'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Message Textarea */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Message Content <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows={4}
              placeholder="Enter the full announcement details and instructions for users..."
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (validationError) setValidationError('');
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                background: 'var(--card-background)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                resize: 'vertical',
                lineHeight: 1.5,
                outline: 'none'
              }}
              disabled={loading}
              required
            />
          </div>

          {/* Publish Checkbox / Status Toggle */}
          <div style={{
            padding: '14px 16px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            background: 'var(--hover-bg, #f8fafc)',
            marginBottom: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                {publishImmediately ? 'Publish to all users immediately' : 'Save as private draft'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {publishImmediately 
                  ? 'All senders and couriers will receive an unread notification in their notifications center'
                  : 'Only administrators will see this announcement until published'}
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px', flexShrink: 0 }}>
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                disabled={loading}
                style={{ opacity: 0, width: 0, height: 0 }}
              />
              <span style={{
                position: 'absolute',
                cursor: 'pointer',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: publishImmediately ? '#10b981' : '#cbd5e1',
                borderRadius: '24px',
                transition: '0.2s',
              }}>
                <span style={{
                  position: 'absolute',
                  content: '""',
                  height: '18px',
                  width: '18px',
                  left: publishImmediately ? '22px' : '3px',
                  bottom: '3px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  transition: '0.2s',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
              </span>
            </label>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="dashboard-btn-outline"
              onClick={handleClose}
              disabled={loading}
              style={{ minWidth: '100px' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="dashboard-btn-primary"
              style={{
                padding: '10px 22px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="spin" size={14} /> Saving...
                </>
              ) : isEdit ? (
                <>
                  <FaCheckCircle size={13} /> Update Announcement
                </>
              ) : publishImmediately ? (
                <>
                  <FaBullhorn size={13} /> Publish Announcement
                </>
              ) : (
                <>
                  Save as Draft
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementModal;

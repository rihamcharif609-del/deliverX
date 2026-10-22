import React, { useState } from 'react';
import { 
  FaBan, 
  FaTimes, 
  FaSpinner, 
  FaExclamationTriangle, 
  FaClock, 
  FaShieldAlt 
} from 'react-icons/fa';

const durationOptions = [
  { value: '24h', label: '24 Hours', desc: 'Temporary cooling-off period' },
  { value: '7d', label: '7 Days', desc: '1 week suspension' },
  { value: '30d', label: '30 Days', desc: '1 month suspension' },
  { value: 'indefinite', label: 'Indefinite', desc: 'Until manually unsuspended' },
];

const SuspendUserModal = ({
  isOpen,
  user,
  onClose,
  onConfirm,
  loading = false,
  error = '',
}) => {
  const [duration, setDuration] = useState('24h');
  const [reason, setReason] = useState('');
  const [validationError, setValidationError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setValidationError('Please provide a reason for the account suspension.');
      return;
    }
    if (reason.trim().length < 5) {
      setValidationError('Reason must be at least 5 characters long.');
      return;
    }

    setValidationError('');
    onConfirm({
      userId: user.id,
      duration,
      reason: reason.trim(),
    });
  };

  const handleClose = () => {
    if (loading) return;
    setReason('');
    setDuration('24h');
    setValidationError('');
    onClose();
  };

  const getRoleBadgeStyle = (role) => {
    const roleKey = (role || 'sender').toLowerCase();
    if (roleKey === 'courier') {
      return { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.25)' };
    }
    return { bg: 'rgba(37, 99, 235, 0.12)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.25)' };
  };

  const roleStyle = getRoleBadgeStyle(user.role);

  return (
    <div className="courier-modal-backdrop" onClick={handleClose}>
      <div 
        className="courier-modal-card" 
        style={{ maxWidth: '520px', width: '100%', padding: '28px' }}
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
            background: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            flexShrink: 0
          }}>
            <FaBan />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)' }}>
              Suspend Account
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Restrict platform access and terminate active sessions
            </p>
          </div>
        </div>

        {/* User Info Capsule */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: 'var(--hover-bg, #f8fafc)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>
              {user.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {user.email}
            </div>
          </div>
          <span style={{
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '11px',
            fontWeight: '700',
            backgroundColor: roleStyle.bg,
            color: roleStyle.color,
            border: roleStyle.border,
            textTransform: 'uppercase',
            letterSpacing: '0.4px',
          }}>
            {user.role}
          </span>
        </div>

        {/* Error Messages */}
        {(validationError || error) && (
          <div style={{
            marginBottom: '16px',
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
          {/* Duration Selection */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '10px'
            }}>
              <FaClock size={12} style={{ color: 'var(--primary-color)' }} />
              Suspension Duration
            </label>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
            }}>
              {durationOptions.map((opt) => {
                const isSelected = duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      border: isSelected ? '2px solid #ef4444' : '1px solid var(--border-color)',
                      background: isSelected ? 'rgba(239, 68, 68, 0.06)' : 'var(--card-background)',
                      color: 'var(--text-primary)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      outline: 'none'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <span style={{
                        fontWeight: '700',
                        fontSize: '13px',
                        color: isSelected ? '#ef4444' : 'var(--text-primary)'
                      }}>
                        {opt.label}
                      </span>
                      <span style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        border: isSelected ? '4px solid #ef4444' : '2px solid var(--border-color)',
                        background: 'transparent'
                      }} />
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {opt.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reason Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '700',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px'
            }}>
              Reason for Suspension <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Specify the reason (e.g. non-compliance with terms, delivery fraud, fraudulent customer dispute, abusive behavior)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
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
                lineHeight: 1.45,
                outline: 'none'
              }}
              disabled={loading}
              required
            />
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              This reason will be recorded in the system audit trail and communicated to the user upon login attempts.
            </div>
          </div>

          {/* Warning Impact Callout */}
          <div style={{
            padding: '12px 14px',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            marginBottom: '24px',
            display: 'flex',
            gap: '10px',
            fontSize: '12px',
            color: '#b91c1c',
            lineHeight: 1.45
          }}>
            <FaShieldAlt size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#ef4444' }} />
            <div>
              <strong>IMPACT:</strong> All active sessions will be terminated immediately. The user will be barred from logging in and accessing DeliverX features {duration === 'indefinite' ? 'indefinitely' : `for ${durationOptions.find(d => d.value === duration)?.label}`}.
            </div>
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
              style={{
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '10px 20px',
                fontSize: '13px',
                fontWeight: '700',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)',
                transition: 'background 0.2s ease',
              }}
            >
              {loading ? (
                <>
                  <FaSpinner className="spin" size={14} /> Suspending...
                </>
              ) : (
                <>
                  <FaBan size={13} /> Confirm Suspension
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuspendUserModal;

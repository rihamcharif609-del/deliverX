import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { useDelivery } from '../context/DeliveryContext';
import { FaMotorcycle, FaBoxOpen, FaRoute, FaCheckCircle, FaLock, FaKey, FaSpinner, FaTimes } from 'react-icons/fa';

const CourierDeliveryTable = ({ selectedFilter = 'All', searchQuery = '', onViewDetails }) => {
  const { deliveries, updateDeliveryState, confirmDeliveryOTP } = useDelivery();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetId, setOtpTargetId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const filteredData = deliveries.filter((d) => {
    let mappedFilter = selectedFilter.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      String(d.id || '').toLowerCase().includes(query) ||
      String(d.pickup || d.from || '').toLowerCase().includes(query) ||
      String(d.destination || d.to || '').toLowerCase().includes(query);

    if (!matchesSearch) return false;

    if (mappedFilter === 'pending') {
      return d.status === 'accepted' || d.status === 'paid';
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

  const handleOpenOtpModal = (deliveryId) => {
    setOtpTargetId(deliveryId);
    setOtpCode('');
    setOtpError('');
    setOtpSuccess(false);
    setShowOtpModal(true);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setOtpError('Delivery code must be exactly 4 digits.');
      return;
    }

    setOtpError('');
    setIsVerifying(true);

    setTimeout(async () => {
      const res = await confirmDeliveryOTP(otpTargetId, otpCode);
      setIsVerifying(false);
      if (res && res.success) {
        setOtpSuccess(true);
        setTimeout(() => {
          setShowOtpModal(false);
          setOtpTargetId(null);
          setOtpCode('');
          setOtpSuccess(false);
        }, 1500);
      } else {
        setOtpError(res?.message || 'Invalid delivery code! Please ask the sender for the code.');
      }
    }, 1200);
  };

  const handleUpdateState = async (deliveryId, nextStatus) => {
    try {
      await updateDeliveryState(deliveryId, nextStatus);
    } catch (err) {
      alert(err.response?.data?.message || 'Could not update delivery status.');
    }
  };

  return (
    <div className="table-container dashboard-table-card">
      <table className="dashboard-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Sender</th>
            <th>Route</th>
            <th>Package Info</th>
            <th>Payment Status</th>
            <th>Status</th>
            <th>Your Earnings</th>
            <th style={{ textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="8" className="empty-table-cell">
                No active delivery requests. Go to "Available Deliveries" to accept new orders!
              </td>
            </tr>
          ) : (
            filteredData.map((d) => {
              const courierEarnings = d.amount - (d.commission || (d.amount * 0.15));
              return (
                <tr key={d.id} className="table-row-hover">
                  <td className="cell-id">{d.id}</td>
                  
                  <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                    {d.customer || 'John Sender'}
                  </td>

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

                  <td>
                    <div className="package-cell">
                      <span className="package-title">{d.packageType || d.type || 'Standard Package'}</span>
                      <span className="package-weight">{d.weight || 'Standard Weight'}</span>
                    </div>
                  </td>

                  <td>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 12px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? '#10b981' : '#ef4444',
                      border: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? '#10b981' : '#ef4444'
                      }} />
                      {d.paymentStatus === 'held' ? 'Held in Escrow' : d.paymentStatus === 'released' ? 'Released' : 'Pending Unpaid'}
                    </span>
                  </td>

                  <td>
                    <StatusBadge status={d.status} />
                  </td>

                  <td>
                    <span className="amount-value" style={{ fontSize: '15px' }}>
                      {courierEarnings.toFixed(2)} MAD
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {onViewDetails && (
                      <button
                        type="button"
                        className="dashboard-btn-outline btn-sm"
                        style={{ padding: '4px 12px', fontSize: '12px' }}
                        onClick={() => onViewDetails(d)}
                      >
                        View
                      </button>
                    )}
                    {d.status === 'accepted' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ 
                          fontSize: '11px', 
                          color: '#ef4444', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '5px', 
                          fontWeight: '700',
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          padding: '3px 10px',
                          borderRadius: '999px'
                        }}>
                          <FaLock size={10} /> Locked
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Awaiting sender payment</span>
                      </div>
                    )}

                    {d.status === 'paid' && (
                      <button 
                        className="dashboard-btn-primary btn-sm"
                        onClick={() => handleUpdateState(d.id, 'picked-up')}
                        style={{
                          background: '#2563eb',
                          width: 'auto',
                          padding: '7px 14px',
                          fontSize: '12px',
                          borderRadius: '8px'
                        }}
                      >
                        <FaBoxOpen size={12} /> Confirm Pickup
                      </button>
                    )}

                    {d.status === 'picked-up' && (
                      <button 
                        className="dashboard-btn-primary btn-sm"
                        onClick={() => handleUpdateState(d.id, 'in-transit')}
                        style={{
                          background: '#f59e0b',
                          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
                          width: 'auto',
                          padding: '7px 14px',
                          fontSize: '12px',
                          borderRadius: '8px'
                        }}
                      >
                        <FaRoute size={12} /> Start Transit
                      </button>
                    )}

                    {d.status === 'in-transit' && (
                      <button 
                        className="dashboard-btn-primary btn-sm"
                        onClick={() => handleOpenOtpModal(d.id)}
                        style={{
                          background: '#10b981',
                          boxShadow: '0 4px 14px rgba(16, 185, 129, 0.35)',
                          width: 'auto',
                          padding: '7px 16px',
                          fontSize: '12px',
                          borderRadius: '8px'
                        }}
                      >
                        <FaKey size={12} /> Verify OTP
                      </button>
                    )}

                    {d.status === 'delivered' && (
                      <span style={{ color: '#10b981', fontWeight: '700', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <FaCheckCircle size={14} /> Completed
                      </span>
                    )}

                    {d.status === 'cancelled' && (
                      <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '13px' }}>Cancelled</span>
                    )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* OTP SECURE VERIFICATION POPUP MODAL */}
      {showOtpModal && (
        <div className="courier-modal-backdrop" onClick={() => setShowOtpModal(false)}>
          <div className="courier-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ 
                  backgroundColor: 'rgba(16, 185, 129, 0.15)', 
                  color: '#10b981', 
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '8px', 
                  borderRadius: '12px', 
                  display: 'flex' 
                }}>
                  <FaKey size={16} />
                </span>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>Secure Delivery Verification</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>DeliverX OTP System</span>
                </div>
              </div>
              <button 
                onClick={() => setShowOtpModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
              >
                <FaTimes />
              </button>
            </div>

            {otpSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <FaCheckCircle size={56} style={{ color: '#10b981', marginBottom: '16px', filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.35))' }} />
                <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '20px', fontWeight: '800' }}>OTP Code Correct!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                  Delivery completed successfully. Escrow funds and earnings have been credited to your Moroccan wallet.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '20px' }}>
                  Ask the recipient/sender for the 4-digit code shown on their tracking screen. Entering it correctly confirms delivery and instantly releases your earnings.
                </p>

                {otpError && (
                  <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
                    <span>⚠️ {otpError}</span>
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    4-Digit Delivery Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="• • • •"
                    maxLength="4"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'var(--hover-bg)',
                      border: '2px solid rgba(16, 185, 129, 0.4)',
                      color: 'var(--text-primary)',
                      fontSize: '26px',
                      fontWeight: '800',
                      letterSpacing: '14px',
                      textAlign: 'center',
                      fontFamily: 'monospace',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="dashboard-btn-outline"
                    onClick={() => setShowOtpModal(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="dashboard-btn-primary"
                    style={{
                      flex: 1.5,
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#fff',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)'
                    }}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <>
                        <FaSpinner className="spin" /> Verifying...
                      </>
                    ) : (
                      'Verify & Confirm'
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default CourierDeliveryTable;

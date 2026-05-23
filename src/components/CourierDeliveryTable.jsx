import React, { useState } from 'react';
import StatusBadge from './StatusBadge';
import { useDelivery } from '../context/DeliveryContext';
import { FaMotorcycle, FaBoxOpen, FaRoute, FaCheckCircle, FaLock, FaKey, FaSpinner, FaTimes } from 'react-icons/fa';

const CourierDeliveryTable = ({ selectedFilter = 'All', onViewDetails }) => {
  const { deliveries, updateDeliveryState, confirmDeliveryOTP } = useDelivery();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpTargetId, setOtpTargetId] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Filter deliveries assigned to courier 'Mike Smith'
  const courierDeliveries = deliveries.filter(d => d.courier === 'Mike Smith');

  const filteredData = courierDeliveries.filter((d) => {
    let mappedFilter = selectedFilter.toLowerCase();
    if (mappedFilter === 'pending') {
      return d.status === 'accepted' || d.status === 'paid' || d.status === 'picked-up';
    }
    if (mappedFilter === 'in transit') {
      return d.status === 'in-transit';
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

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setOtpError('Delivery code must be exactly 4 digits.');
      return;
    }

    setOtpError('');
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      const res = confirmDeliveryOTP(otpTargetId, otpCode);
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

  return (
    <div className="table-container" style={{
      background: 'var(--card-background)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>ID</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Sender</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Route</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Package Info</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Payment Status</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Status</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Your Earnings</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No active delivery requests. Go to "Available Deliveries" to accept new orders!
              </td>
            </tr>
          ) : (
            filteredData.map((d) => {
              const courierEarnings = d.amount - (d.commission || (d.amount * 0.15));
              return (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{d.id}</td>
                  
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    {d.customer || 'John Sender'}
                  </td>

                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 4px 0', fontSize: '13px' }}>
                      <strong style={{ color: '#2563eb' }}>From:</strong> {d.pickup || d.from}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px' }}>
                      <strong style={{ color: '#10b981' }}>To:</strong> {d.destination || d.to}
                    </p>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <p style={{ margin: '0 0 2px 0', fontWeight: '500' }}>{d.packageType || d.type}</p>
                    <p style={{ margin: 0, color: 'gray', fontSize: '11px' }}>{d.weight}</p>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: '600',
                      backgroundColor: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: d.paymentStatus === 'held' || d.paymentStatus === 'released' ? '#10b981' : '#ef4444'
                    }}>
                      {d.paymentStatus === 'held' ? 'Held in Escrow' : d.paymentStatus === 'released' ? 'Released' : 'Pending Unpaid'}
                    </span>
                  </td>

                  <td style={{ padding: '16px' }}>
                    <StatusBadge status={d.status} />
                  </td>

                  <td style={{ padding: '16px', fontWeight: '700', color: '#10b981' }}>
                    {courierEarnings.toFixed(2)} MAD
                  </td>

                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    {onViewDetails && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '11px' }}
                        onClick={() => onViewDetails(d)}
                      >
                        View
                      </button>
                    )}
                    {d.status === 'accepted' && (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <FaLock size={10} /> Locked
                        </span>
                        <span style={{ fontSize: '10px', color: 'gray' }}>Awaiting sender payment</span>
                      </div>
                    )}

                    {d.status === 'paid' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => updateDeliveryState(d.id, 'picked-up')}
                        style={{
                          backgroundColor: '#2563eb',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaBoxOpen size={12} /> Confirm Pickup
                      </button>
                    )}

                    {d.status === 'picked-up' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => updateDeliveryState(d.id, 'in-transit')}
                        style={{
                          backgroundColor: '#eab308',
                          color: '#000',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        <FaRoute size={12} /> Start Transit
                      </button>
                    )}

                    {d.status === 'in-transit' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleOpenOtpModal(d.id)}
                        style={{
                          backgroundColor: '#10b981',
                          color: '#fff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <FaKey size={12} /> Verify OTP
                      </button>
                    )}

                    {d.status === 'delivered' && (
                      <span style={{ color: '#10b981', fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <FaCheckCircle size={14} /> Completed
                      </span>
                    )}

                    {d.status === 'cancelled' && (
                      <span style={{ color: 'gray', fontStyle: 'italic', fontSize: '13px' }}>Cancelled</span>
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
        <div className="payment-modal-backdrop" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }} onClick={() => setShowOtpModal(false)}>
          <div className="payment-modal-card" style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            padding: '30px',
            width: '100%',
            maxWidth: '400px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            animation: 'fadeIn 0.3s ease'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                  <FaKey size={16} />
                </span>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Secure Delivery Verification</h3>
              </div>
              <button 
                onClick={() => setShowOtpModal(false)}
                style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer', fontSize: '16px' }}
              >
                <FaTimes />
              </button>
            </div>

            {otpSuccess ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <FaCheckCircle size={48} style={{ color: '#10b981', marginBottom: '16px', animation: 'successIcon 0.5s ease-out' }} />
                <h4 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '18px' }}>OTP Code Correct!</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                  Delivery completed successfully. Escrow funds and earnings have been credited to your wallet balance.
                </p>
              </div>
            ) : (
              <form onSubmit={handleVerifyOtp}>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '20px' }}>
                  Ask the sender to give you the 4-digit code shown on their tracking screen. Entering it correctly completes delivery and releases your earnings.
                </p>

                {otpError && (
                  <div style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.12)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    color: '#ef4444',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '16px',
                    lineHeight: '1.4'
                  }}>
                    ⚠️ {otpError}
                  </div>
                )}

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '600' }}>
                    4-Digit Delivery Code (OTP)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 4821"
                    maxLength="4"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: '20px',
                      fontWeight: '700',
                      letterSpacing: '8px',
                      textAlign: 'center',
                      fontFamily: 'monospace'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowOtpModal(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px' }}
                    disabled={isVerifying}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      flex: 1.5,
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: '#10b981',
                      border: 'none',
                      color: '#fff',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
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

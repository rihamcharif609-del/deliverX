import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import { FaLock, FaCreditCard, FaTimes, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaFileAlt } from 'react-icons/fa';

const PaymentModal = ({ isOpen, onClose, delivery }) => {
  const { t } = useLanguage();
  const { payDelivery } = useDelivery();

  const [cardHolder, setCardHolder] = useState('John Sender');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !delivery) return null;

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(value);
    }
  };

  // Format Expiry (adds slash)
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\//g, '').replace(/[^0-9]/gi, '');
    if (value.length <= 4) {
      if (value.length > 2) {
        setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
      } else {
        setExpiry(value);
      }
    }
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/gi, '');
    if (value.length <= 3) {
      setCvv(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setErrorMsg('Card number must be 16 digits.');
      return;
    }
    if (expiry.length < 5) {
      setErrorMsg('Invalid expiry date (MM/YY).');
      return;
    }
    if (cvv.length < 3) {
      setErrorMsg('CVV must be 3 digits.');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);

    // Simulate CMI payment gateway processing
    setTimeout(() => {
      setIsSubmitting(false);
      setPaymentSuccess(true);
      payDelivery(delivery.id, cardHolder);

      // Close modal after showing success animation
      setTimeout(() => {
        setPaymentSuccess(false);
        onClose();
      }, 2500);
    }, 2000);
  };

  const platformFee = delivery.commission || (delivery.amount * 0.15);
  const baseFee = delivery.amount - platformFee;

  return (
    <div className="payment-modal-backdrop" onClick={onClose}>
      <div className="payment-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="payment-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="secure-badge">
              <FaLock size={12} /> SECURE PAYMENT
            </span>
            <span style={{ fontSize: '11px', color: 'gray', fontWeight: 'bold' }}>CMI GATEWAY (MAROC)</span>
          </div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {paymentSuccess ? (
          <div className="payment-success-state">
            <FaCheckCircle className="success-icon-anim" />
            <h2>Payment Successful!</h2>
            <p>100% Secure transaction completed.</p>
            <div className="otp-display-box">
              <span className="otp-label">Secure Delivery Code (OTP):</span>
              <span className="otp-code-highlight">
                {Math.floor(1000 + Math.random() * 9000) /* Temporary display, synced to localstorage */}
              </span>
              <p className="otp-hint">Provide this 4-digit code to the courier to confirm delivery.</p>
            </div>
          </div>
        ) : (
          <div className="payment-modal-body">
            {/* Delivery Summary */}
            <div className="delivery-summary-pane">
              <h3>Delivery Summary</h3>
              <div className="summary-item">
                <span className="label">Delivery ID:</span>
                <span className="value font-mono">{delivery.id}</span>
              </div>
              <div className="summary-item">
                <span className="label">Customer:</span>
                <span className="value">{delivery.customer || 'John Sender'}</span>
              </div>
              <div className="summary-item">
                <span className="label">Courier:</span>
                <span className="value">{delivery.courier || 'Mike Smith'}</span>
              </div>
              
              <div className="route-details-box">
                <p>
                  <FaMapMarkerAlt style={{ color: '#3b82f6', marginRight: '6px' }} />
                  <strong>From:</strong> {delivery.pickup || delivery.from}
                </p>
                <p style={{ marginTop: '8px' }}>
                  <FaMapMarkerAlt style={{ color: '#10b981', marginRight: '6px' }} />
                  <strong>To:</strong> {delivery.destination || delivery.to}
                </p>
              </div>

              <div className="price-breakdown">
                <div className="price-row">
                  <span>Delivery Fee:</span>
                  <span>{baseFee.toFixed(2)} MAD</span>
                </div>
                <div className="price-row">
                  <span>Platform Service Fee (15%):</span>
                  <span>{platformFee.toFixed(2)} MAD</span>
                </div>
                <hr className="divider" />
                <div className="price-row total">
                  <span>Total Amount:</span>
                  <span className="price-tag">{delivery.amount.toFixed(2)} MAD</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmit} className="payment-form-pane">
              <h3>Enter Payment Details</h3>
              <p style={{ fontSize: '12px', color: 'gray', marginBottom: '15px' }}>
                All transactions are encrypted and processed by CMI (Centre Monétique Interbancaire).
              </p>

              {errorMsg && (
                <div className="payment-error-alert">
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Sender"
                  className="form-control font-medium"
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Card Number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    required
                    placeholder="xxxx xxxx xxxx xxxx"
                    maxLength="19"
                    className="form-control font-mono"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    style={{ paddingLeft: '40px' }}
                  />
                  <FaCreditCard style={{ position: 'absolute', left: '12px', top: '15px', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '15px' }}>
                <div className="form-group">
                  <label>Expiry Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    maxLength="5"
                    className="form-control font-mono"
                    value={expiry}
                    onChange={handleExpiryChange}
                  />
                </div>
                <div className="form-group">
                  <label>CVV / CVC</label>
                  <input
                    type="password"
                    required
                    placeholder="123"
                    maxLength="3"
                    className="form-control font-mono"
                    value={cvv}
                    onChange={handleCvvChange}
                  />
                </div>
              </div>

              <div style={{ marginTop: '25px', display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spin" /> Processing...
                    </>
                  ) : (
                    `Pay ${delivery.amount.toFixed(2)} MAD`
                  )}
                </button>
              </div>

              <div className="pci-compliance-footer">
                <span>🛡️ PCI-DSS Compliant</span>
                <span>•</span>
                <span>🔒 256-bit SSL</span>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentModal;

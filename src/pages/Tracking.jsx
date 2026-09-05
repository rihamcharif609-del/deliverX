import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import PaymentModal from '../components/PaymentModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  FaCreditCard, 
  FaLock, 
  FaKey, 
  FaBox, 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaWhatsapp,
  FaSearchLocation,
  FaCheck,
  FaTimes,
  FaStar,
  FaShieldAlt,
  FaTruck
} from 'react-icons/fa';

const ADMIN_SUPPORT_EMAIL = 'admin@deliverx.com';
const ADMIN_SUPPORT_PHONE = '+212 600-000000';

const cleanPhone = (phone) => {
  let num = phone ? phone.replace(/\D/g, '') : '';
  if (num.startsWith('0') && num.length === 10) {
    num = '212' + num.slice(1);
  } else if (num.length === 9) {
    num = '212' + num;
  }
  return num;
};

const openWhatsApp = (phone, message) => {
  if (!phone) return;
  const url = `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveries, deliveriesLoading, fetchDeliveries, rateCourier, cancelDelivery, cancellingDeliveryId, ratingDeliveryId } = useDelivery();
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [ratingSaving, setRatingSaving] = useState(false);

  useEffect(() => {
    setRatingInput(0);
    setHoverRating(0);
    setCommentInput('');
    setRatingSubmitted(false);
    setRatingError('');
    setRatingSaving(false);
  }, [id]);

  useEffect(() => {
    if (deliveries.length === 0) {
      fetchDeliveries('sender').catch(() => {});
    }
  }, [deliveries.length, fetchDeliveries]);

  const hasCourier = (item) => Boolean(item?.courier || item?.courierId);
  const normalizedId = id ? String(id) : '';
  const delivery = id
    ? deliveries.find(d => String(d.id) === normalizedId || String(d.apiId) === normalizedId)
    : deliveries.find(d => hasCourier(d) && d.status !== 'cancelled') || deliveries[0];

  const courierName = delivery?.courier || 'Courier';
  const courierPhone = delivery?.courierPhone || '+212 660-000000';
  const courierEmail = delivery?.courierEmail || 'courier@deliverx.com';
  const courierInitials = courierName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'C';
  const acceptedAt = delivery?.acceptedAt
    ? new Date(delivery.acceptedAt).toLocaleString()
    : 'Accepted for this delivery';
  const supportHref = `mailto:${ADMIN_SUPPORT_EMAIL}?subject=${encodeURIComponent(`Support request for ${delivery?.id || 'delivery'}`)}&body=${encodeURIComponent(`Hello Admin,\n\nI need help with delivery ${delivery?.id || ''}.`)}`;
  const isRatingSaving = ratingSaving || ratingDeliveryId === delivery?.id;

  if (deliveriesLoading && !delivery) {
    return (
      <MainLayout userRole="sender" activePage="/sender/tracking">
        <LoadingSpinner centered label="Loading tracking details..." minHeight="360px" />
      </MainLayout>
    );
  }

  if (!delivery) {
    return (
      <MainLayout userRole="sender" activePage="/sender/tracking">
        <div className="recent-deliveries-section" style={{ textAlign: 'center', padding: '60px 20px', margin: '40px auto', maxWidth: '600px' }}>
          <FaSearchLocation style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>No Delivery Selected</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>Please select a delivery from your list to track it.</p>
          <button className="dashboard-btn-primary" onClick={() => navigate('/sender/deliveries')}>
            Go to My Deliveries
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleCancelDelivery = async () => {
    if (window.confirm("Are you sure you want to cancel this delivery request?")) {
      await cancelDelivery(delivery.id);
      alert("Delivery cancelled.");
    }
  };

  const getTimeline = (status) => {
    const steps = [
      {
        title: 'Order Placed',
        description: 'Delivery request created in system',
        time: `${delivery.date} at ${delivery.time}`,
        completed: true,
      },
      {
        title: 'Courier Accepted',
        description: delivery.courier ? `${delivery.courier} accepted your request` : 'Waiting for a courier to accept',
        time: delivery.courier ? 'Completed' : 'Pending',
        completed: !!delivery.courier,
      },
      {
        title: 'Online Payment',
        description: status === 'accepted' ? 'Payment required first' : (status === 'waiting-courier' ? 'Waiting for courier assignment' : 'Payment secured in escrow (Held)'),
        time: status !== 'waiting-courier' && status !== 'accepted' && status !== 'cancelled' ? 'Paid' : 'Pending',
        completed: status !== 'waiting-courier' && status !== 'accepted' && status !== 'cancelled',
      },
      {
        title: 'Picked Up',
        description: 'Package picked up from sender',
        time: status === 'picked-up' || status === 'in-transit' || status === 'delivered' ? 'Completed' : 'Pending',
        completed: status === 'picked-up' || status === 'in-transit' || status === 'delivered',
      },
      {
        title: 'In Transit',
        description: 'Package is on the way to destination',
        time: status === 'in-transit' ? 'Current' : status === 'delivered' ? 'Completed' : 'Pending',
        completed: status === 'delivered',
        current: status === 'in-transit',
      },
      {
        title: 'Delivered',
        description: 'Package delivered and payout released',
        time: status === 'delivered' ? 'Completed' : 'Pending',
        completed: status === 'delivered',
      },
    ];

    if (status === 'cancelled') {
      steps.push({
        title: 'Cancelled',
        description: 'This delivery request was cancelled',
        time: 'Cancelled',
        completed: true,
        cancelled: true
      });
    }

    return steps;
  };

  const timeline = getTimeline(delivery.status);

  // Dynamic courier positions on map based on status
  let courierStyle = {
    position: 'absolute',
    transition: 'all 1s ease-in-out'
  };

  if (delivery.status === 'waiting-courier' || delivery.status === 'accepted') {
    courierStyle.top = '60px';
    courierStyle.left = '95px';
  } else if (delivery.status === 'picked-up' || delivery.status === 'in-transit') {
    courierStyle.top = '140px';
    courierStyle.left = '200px';
  } else if (delivery.status === 'delivered') {
    courierStyle.bottom = '70px';
    courierStyle.right = '115px';
  } else {
    courierStyle.display = 'none';
  }

  return (
    <MainLayout userRole="sender" activePage="/sender/tracking">
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaSearchLocation style={{ fontSize: '11px' }} />
            <span>LIVE PACKAGE TRACKING</span>
          </div>
          <h1 className="hero-banner-title">
            Tracking #{delivery.id}
          </h1>
          <p className="hero-banner-subtitle">
            Real-time status updates, live courier position, and secure OTP verification.
          </p>
        </div>
        <div className="hero-banner-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <StatusBadge status={delivery.status} />
          <button 
            type="button"
            className="hero-banner-btn-primary"
            onClick={() => navigate('/sender/deliveries')}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }}
          >
            <FaArrowLeft /> Back to Deliveries
          </button>
        </div>
      </div>

      {/* ===== TOP GRID LAYOUT ===== */}
      <div className="dashboard-grid grid-5" style={{ gap: '24px', alignItems: 'start', marginBottom: '28px' }}>
        
        {/* LEFT COLUMN */}
        <div>
          {/* ONLINE PAYMENT REQUIRED BANNER */}
          {delivery.status === 'accepted' && (
            <div className="form-section-card" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), var(--card-background))',
              border: '1.5px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                fontSize: '22px'
              }}>
                <FaCreditCard />
              </div>
              <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Online Payment Required</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' }}>
                Courier <strong>{delivery.courier}</strong> has accepted your delivery request! Please complete secure payment to begin pickup.
              </p>
              <button 
                className="pay-now-btn"
                onClick={() => setIsPaymentOpen(true)}
                style={{
                  padding: '12px 28px',
                  borderRadius: '10px',
                  fontSize: '14px',
                  margin: '0 auto'
                }}
              >
                <FaLock size={12} /> Proceed to Payment ({delivery.amount} MAD)
              </button>
            </div>
          )}

          {/* SECURE DELIVERY CODE CARD (OTP) */}
          {(delivery.status === 'paid' || delivery.status === 'picked-up' || delivery.status === 'in-transit') && delivery.otp && (
            <div className="form-section-card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), var(--card-background))',
              border: '1.5px solid rgba(16, 185, 129, 0.3)',
              marginBottom: '20px',
              textAlign: 'center',
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
                fontSize: '22px'
              }}>
                <FaKey />
              </div>
              <h3 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800' }}>Secure Delivery Code (OTP)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '18px' }}>
                Provide this verification code to the courier <strong>upon arrival</strong> to confirm dropoff and complete payment.
              </p>
              <div style={{
                background: 'var(--card-background)',
                border: '2px dashed #10b981',
                borderRadius: '12px',
                padding: '12px 28px',
                fontSize: '28px',
                fontWeight: '800',
                color: '#10b981',
                letterSpacing: '6px',
                display: 'inline-block',
                fontFamily: 'monospace'
              }}>
                {delivery.otp}
              </div>
            </div>
          )}

          {/* ORDER SPECIFICATIONS CARD */}
          <div className="form-section-card" style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0 }}>Order Details #{delivery.id}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '2px', margin: 0 }}>Created on {delivery.date} at {delivery.time}</p>
              </div>
            </div>

            {/* ROUTE POINTS */}
            <div className="dashboard-grid grid-5" style={{ gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#2563eb', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <FaMapMarkerAlt /> Pickup Address
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{delivery.pickup || delivery.from}</strong>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '6px' }}>
                  <FaMapMarkerAlt /> Dropoff Address
                </span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>{delivery.destination || delivery.to}</strong>
              </div>
            </div>

            {/* PACKAGE SPECS */}
            <div className="dashboard-grid grid-3" style={{ gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Package Type</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>{delivery.packageType || delivery.type}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Weight</span>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>{delivery.weight || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Total Amount</span>
                <strong style={{ fontSize: '14px', color: '#10b981', marginTop: '2px', display: 'block', fontWeight: '800' }}>{delivery.amount} MAD</strong>
              </div>
            </div>
          </div>

          {/* LIVE MAP CONTAINER */}
          <div className="form-section-card">
            <div className="form-card-header">
              <div className="form-card-icon-badge pickup">
                <FaSearchLocation />
              </div>
              <div>
                <h3>{t('liveLocation') || 'Live Delivery Map'}</h3>
                <p>Real-time courier GPS positioning</p>
              </div>
            </div>

            <div
              style={{
                height: '320px',
                borderRadius: '14px',
                background: darkMode
                  ? 'linear-gradient(135deg, #1e293b, #0f172a)'
                  : 'linear-gradient(135deg, #dbeafe, #dcfce7)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
              }}
            >
              {/* PICKUP */}
              <div style={{ position: 'absolute', top: '40px', left: '60px' }}>
                <div style={{
                  background: 'var(--card-background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  📍 Pickup Point
                </div>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#2563eb', marginLeft: '35px', boxShadow: '0 0 0 4px rgba(37,99,235,0.3)' }} />
              </div>

              {/* COURIER */}
              {delivery.status !== 'cancelled' && (
                <div style={courierStyle}>
                  <div style={{
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}>
                    🚚 {t('yourCourier') || 'Courier'}
                  </div>
                  <div style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: '#f59e0b',
                    marginLeft: '35px',
                    border: darkMode ? '4px solid var(--card-background)' : '4px solid white',
                    boxShadow: '0 0 0 4px rgba(245,158,11,0.3)'
                  }} />
                </div>
              )}

              {/* DROPOFF */}
              <div style={{ position: 'absolute', bottom: '40px', right: '60px' }}>
                <div style={{
                  background: 'var(--card-background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  🏁 Dropoff Point
                </div>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#10b981', marginLeft: '35px', boxShadow: '0 0 0 4px rgba(16,185,129,0.3)' }} />
              </div>

              {/* LIVE TRACKING BADGE */}
              {delivery.status !== 'cancelled' && (
                <div style={{
                  position: 'absolute',
                  right: '16px',
                  bottom: '16px',
                  background: 'var(--card-background)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  padding: '8px 14px',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Live tracking active</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* ESTIMATED ARRIVAL CARD */}
          <div className="form-section-card" style={{
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08), var(--card-background))',
            border: '1.5px solid rgba(37, 99, 235, 0.25)',
            textAlign: 'center',
            marginBottom: '20px'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
              {t('estimatedDelivery') || 'Estimated Arrival'}
            </p>

            <h2 style={{ margin: '8px 0', fontSize: '32px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {delivery.status === 'delivered' ? 'Delivered' : delivery.status === 'cancelled' ? 'Cancelled' : 'Today'}
            </h2>

            <span className="stat-change-badge" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', padding: '4px 12px' }}>
              {delivery.status === 'delivered' 
                ? 'Completed' 
                : delivery.status === 'cancelled' 
                ? 'None' 
                : (delivery.courierArrival ? `Arrival by ${delivery.courierArrival}` : 'Waiting pickup')}
            </span>
          </div>

          {/* ASSIGNED COURIER CARD */}
          <div className="form-section-card" style={{ marginBottom: '20px' }}>
            <div className="form-card-header">
              <div className="form-card-icon-badge pickup">
                <FaTruck />
              </div>
              <div>
                <h3>{t('yourCourier') || 'Assigned Courier'}</h3>
                <p>Driver contact & credentials</p>
              </div>
            </div>

            {delivery.courier ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
                  <div style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '800',
                    fontSize: '18px',
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)'
                  }}>
                    {courierInitials}
                  </div>

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>{courierName}</h4>
                    <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginTop: '2px', display: 'block' }}>
                      ★ {delivery.courierRating || '4.8'} rating · Verified Courier
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', background: 'var(--hover-bg)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FaCalendarAlt style={{ color: '#2563eb' }} />
                    <span>Accepted: {acceptedAt}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                    <FaEnvelope style={{ color: '#8b5cf6' }} />
                    <span>{courierEmail}</span>
                  </div>
                </div>

                <button
                  className="dashboard-btn-outline"
                  onClick={() => { window.location.href = `tel:${courierPhone}`; }}
                  style={{ marginBottom: '10px' }}
                >
                  <FaPhoneAlt size={12} /> Call Courier ({courierPhone})
                </button>
                <button
                  className="dashboard-btn-outline"
                  onClick={() => openWhatsApp(
                    courierPhone,
                    `Hello, I am tracking my delivery request #${delivery?.id || ''}.`
                  )}
                  style={{ borderColor: '#25d366', color: '#25d366', background: 'rgba(37,211,102,0.06)' }}
                >
                  <FaWhatsapp size={14} /> Message via WhatsApp
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-secondary)' }}>
                <FaBox style={{ fontSize: '28px', color: '#2563eb', marginBottom: '8px' }} />
                <p style={{ fontSize: '13px', margin: 0 }}>Searching for nearest available couriers...</p>
              </div>
            )}
          </div>

          {/* RATING CARD */}
          {delivery.status === 'delivered' && delivery.courier && (
            <div className="form-section-card" style={{ marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>Rate Your Courier</h3>
              
              {delivery.ratingGiven || ratingSubmitted ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '28px', color: '#facc15', marginBottom: '8px' }}>
                    {'★'.repeat(delivery.ratingGiven || ratingInput)}
                    {'☆'.repeat(5 - (delivery.ratingGiven || ratingInput))}
                  </div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                    Thank you! You rated {delivery.courier} {(delivery.ratingGiven || ratingInput)} stars.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                    How was your delivery experience with {delivery.courier}?
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          fontSize: '28px',
                          cursor: 'pointer',
                          color: star <= (hoverRating || ratingInput) ? '#facc15' : 'var(--border-color)',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>

                  <button
                    className="dashboard-btn-primary"
                    disabled={ratingInput === 0 || isRatingSaving}
                    onClick={async () => {
                      setRatingError('');
                      setRatingSaving(true);
                      try {
                        await rateCourier(delivery.id, ratingInput, commentInput);
                        setRatingSubmitted(true);
                      } catch (err) {
                        setRatingError(err.response?.data?.message || 'Could not save your rating.');
                      } finally {
                        setRatingSaving(false);
                      }
                    }}
                  >
                    {isRatingSaving ? 'Saving Rating...' : 'Submit Rating'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QUICK ACTIONS CARD */}
          <div className="form-section-card">
            <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px' }}>Quick Support</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                className="dashboard-btn-outline"
                onClick={() => { window.location.href = supportHref; }}
              >
                <FaEnvelope size={12} /> Contact Email Support
              </button>

              <button
                className="dashboard-btn-outline"
                onClick={() => openWhatsApp(
                  ADMIN_SUPPORT_PHONE,
                  `Hello Admin, I need support with my delivery request #${delivery?.id || ''}.`
                )}
                style={{ borderColor: '#25d366', color: '#25d366', background: 'rgba(37,211,102,0.06)' }}
              >
                <FaWhatsapp size={14} /> WhatsApp Support
              </button>

              {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
                <button
                  className="dashboard-btn-outline"
                  style={{ borderColor: '#ef4444', color: '#ef4444', background: 'rgba(239,68,68,0.06)' }}
                  disabled={cancellingDeliveryId === delivery.id}
                  onClick={handleCancelDelivery}
                >
                  {cancellingDeliveryId === delivery.id ? 'Cancelling...' : 'Cancel Delivery Request'}
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ===== DELIVERY TIMELINE JOURNEY ===== */}
      <div className="form-section-card">
        <h3 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '24px' }}>
          {t('deliveryTimeline') || 'Delivery Journey'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {timeline.map((step, index) => (
            <div key={index} style={{ display: 'flex', gap: '18px', position: 'relative', minHeight: '64px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '50%',
                  background: step.cancelled
                    ? '#ef4444'
                    : step.completed
                    ? '#10b981'
                    : 'var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  boxShadow: step.completed ? '0 0 10px rgba(16,185,129,0.3)' : 'none'
                }}>
                  {step.cancelled ? <FaTimes /> : step.completed ? <FaCheck /> : (index + 1)}
                </div>
                {index !== timeline.length - 1 && (
                  <div style={{
                    width: '2px',
                    flex: 1,
                    background: step.completed ? '#10b981' : 'var(--border-color)',
                    margin: '4px 0'
                  }} />
                )}
              </div>

              <div style={{ flex: 1, paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: step.cancelled ? '#ef4444' : 'var(--text-primary)', margin: 0 }}>
                    {step.title}
                  </h4>
                  {step.current && (
                    <span className="status-badge status-in-transit">
                      <span className="status-badge-dot" /> Current Step
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0' }}>{step.description}</p>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>🕒 {step.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Gateway Modal */}
      <PaymentModal 
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        delivery={delivery}
      />
    </MainLayout>
  );
};

export default Tracking;


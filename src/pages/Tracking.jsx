import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import { useParams, useNavigate } from 'react-router-dom';
import ChatPopup from '../components/ChatPopup';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import PaymentModal from '../components/PaymentModal';
import { FaCreditCard, FaLock, FaKey, FaBox, FaArrowLeft, FaMapMarkerAlt, FaCalendarAlt, FaEnvelope, FaPhoneAlt } from 'react-icons/fa';

const Tracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { deliveries, rateCourier } = useDelivery();
  const [showChat, setShowChat] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const { darkMode } = useTheme();
  const { t } = useLanguage();

  const [ratingInput, setRatingInput] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  React.useEffect(() => {
    setRatingInput(0);
    setHoverRating(0);
    setCommentInput('');
    setRatingSubmitted(false);
  }, [id]);

  // Find delivery in state
  const delivery = deliveries.find(d => d.id === id) || deliveries[0];

  if (!delivery) {
    return (
      <MainLayout userRole="sender" activePage="/sender/tracking">
        <div className="page-container" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h2>No Delivery Selected</h2>
          <p>Please select a delivery from your list to track it.</p>
          <button className="btn btn-primary" onClick={() => navigate('/sender/deliveries')} style={{ marginTop: '20px' }}>
            Go to My Deliveries
          </button>
        </div>
      </MainLayout>
    );
  }

  const handleCancelDelivery = () => {
    if (window.confirm("Are you sure you want to cancel this delivery request?")) {
      // Typically updates context, for now alert or update
      alert("Delivery cancellation requested.");
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

  // Dynamic courier positions on the map based on status
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
      {/* HEADER */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button 
            className="btn btn-outline" 
            onClick={() => navigate('/sender/deliveries')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              marginBottom: '12px',
              padding: '6px 12px',
              borderRadius: '8px'
            }}
          >
            <FaArrowLeft size={12} /> Back to My Deliveries
          </button>
          <h1 style={{ fontSize: '32px', marginBottom: '8px' }}>
            {t('trackPackage') || 'Track Delivery'}
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Status updates and Moroccan online payment flow for #{delivery.id}
          </p>
        </div>
        <StatusBadge status={delivery.status} />
      </div>

      {/* TOP GRID */}
      <div
        className="grid grid-2"
        style={{
          gap: '20px',
          alignItems: 'start',
          marginBottom: '30px',
        }}
      >
        {/* LEFT SIDE */}
        <div>
          {/* SECURE ONLINE PAYMENT BANNER */}
          {delivery.status === 'accepted' && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.02))',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.05)'
            }}>
              <div style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '24px'
              }}>
                <FaCreditCard />
              </div>
              <h3 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Online Payment Required</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                Courier <strong>{delivery.courier}</strong> has accepted your delivery request! You must complete your secure payment before the courier can begin the pickup.
              </p>
              <button 
                className="btn btn-primary"
                onClick={() => setIsPaymentOpen(true)}
                style={{
                  backgroundColor: '#ef4444',
                  borderColor: '#ef4444',
                  padding: '12px 24px',
                  borderRadius: '12px',
                  fontWeight: '600',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaLock size={12} /> Proceed to Payment ({delivery.amount} MAD)
              </button>
            </div>
          )}

          {/* SECURE DELIVERY CODE CARD (OTP) */}
          {(delivery.status === 'paid' || delivery.status === 'picked-up' || delivery.status === 'in-transit') && (
            <div className="card" style={{
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.02))',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '20px',
              padding: '24px',
              marginBottom: '20px',
              textAlign: 'center',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.05)'
            }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                fontSize: '24px'
              }}>
                <FaKey />
              </div>
              <h3 style={{ color: '#10b981', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '700' }}>Secure Delivery Code (OTP)</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', marginBottom: '20px' }}>
                Share this secure verification code with the courier <strong>upon arrival</strong>. The courier will enter it into their app to release funds and complete delivery.
              </p>
              <div style={{
                background: 'var(--card-background)',
                border: '2px dashed #10b981',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '28px',
                fontWeight: '800',
                color: '#10b981',
                letterSpacing: '6px',
                display: 'inline-block',
                fontFamily: 'monospace'
              }}>
                {delivery.otp || '4821'}
              </div>
            </div>
          )}

          {/* DELIVERY CARD */}
          <div className="card" style={{ marginBottom: '20px', borderRadius: '20px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '25px',
              }}
            >
              <div>
                <h2>{delivery.id}</h2>
                <p style={{ color: 'gray', marginTop: '5px' }}>
                  Created on {delivery.date}
                </p>
              </div>
            </div>

            {/* LOCATIONS */}
            <div
              className="grid grid-2"
              style={{
                gap: '20px',
                marginBottom: '25px',
              }}
            >
              <div>
                <p style={{ color: 'gray', marginBottom: '8px', fontSize: '12px' }}>
                  📤 {t('pickupLocation') || 'Pickup Address'}
                </p>
                <strong>{delivery.pickup || delivery.from}</strong>
              </div>

              <div>
                <p style={{ color: 'gray', marginBottom: '8px', fontSize: '12px' }}>
                  📥 {t('deliveryLocation') || 'Destination Address'}
                </p>
                <strong>{delivery.destination || delivery.to}</strong>
              </div>
            </div>

            <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

            {/* PACKAGE INFO */}
            <div
              className="grid grid-3"
              style={{ gap: '20px' }}
            >
              <div>
                <p style={{ color: 'gray', fontSize: '12px' }}>{t('packageType') || 'Package Type'}</p>
                <strong style={{ display: 'block', marginTop: '4px' }}>{delivery.packageType || delivery.type}</strong>
              </div>

              <div>
                <p style={{ color: 'gray', fontSize: '12px' }}>{t('weight') || 'Weight'}</p>
                <strong style={{ display: 'block', marginTop: '4px' }}>{delivery.weight}</strong>
              </div>

              <div>
                <p style={{ color: 'gray', fontSize: '12px' }}>Amount (MAD)</p>
                <strong style={{ display: 'block', marginTop: '4px', color: '#10b981' }}>
                  {delivery.amount} MAD
                </strong>
              </div>
            </div>
          </div>

          {/* LIVE MAP */}
          <div className="card" style={{ borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              {t('liveLocation') || 'Live Delivery Map'}
            </h3>

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
              <div
                style={{
                  position: 'absolute',
                  top: '40px',
                  left: '80px',
                }}
              >
                <div
                  style={{
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  Pickup Point
                </div>

                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#2563eb',
                    marginLeft: '35px',
                  }}
                />
              </div>

              {/* COURIER */}
              {delivery.status !== 'cancelled' && (
                <div style={courierStyle}>
                  <div
                    style={{
                      background: 'var(--card-background)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      padding: '6px 10px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      marginBottom: '8px',
                    }}
                  >
                    {t('yourCourier') || 'Courier Position'}
                  </div>

                  <div
                    style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#f59e0b',
                      marginLeft: '40px',
                      border: darkMode ? '4px solid var(--card-background)' : '4px solid white',
                    }}
                  />
                </div>
              )}

              {/* DELIVERY */}
              <div
                style={{
                  position: 'absolute',
                  bottom: '50px',
                  right: '90px',
                }}
              >
                <div
                  style={{
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  Dropoff Point
                </div>

                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#16a34a',
                    marginLeft: '30px',
                  }}
                />
              </div>

              {/* LIVE BADGE */}
              {delivery.status !== 'cancelled' && (
                <div
                  style={{
                    position: 'absolute',
                    right: '20px',
                    bottom: '20px',
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-color)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#22c55e',
                    }}
                  />
                  <span style={{ fontSize: '14px' }}>
                    Live tracking active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div>
          {/* COURIER CARD */}
          <div className="card" style={{ marginBottom: '20px', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              {t('yourCourier') || 'Assigned Courier'}
            </h3>

            {delivery.courier ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    marginBottom: '20px',
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '22px',
                    }}
                  >
                    {delivery.courier.split(' ').map(n => n[0]).join('')}
                  </div>

                  <div>
                    <h3>{delivery.courier}</h3>
                    <p style={{ color: 'gray', fontSize: '13px', marginTop: '4px' }}>
                      ⭐ {delivery.courierRating || '4.8'} (Morocco Active Courier)
                    </p>
                  </div>
                </div>

                <hr style={{ margin: '20px 0', borderColor: 'var(--border-color)' }} />

                <button
                  className="btn btn-outline"
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    borderRadius: '10px'
                  }}
                >
                  <a href={`tel:${delivery.courierPhone || delivery.phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    📞 {delivery.courierPhone || delivery.phone || '+212 660-000000'}
                  </a>
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowChat(true)} 
                  style={{
                    width: '100%',
                    marginBottom: '10px',
                    borderRadius: '10px'
                  }}
                >
                  ✉️ {t('messageCourier') || 'Message Courier'}
                </button>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}><FaBox /></div>
                <p style={{ fontSize: '13px' }}>Searching for nearest available couriers in Casablanca...</p>
              </div>
            )}
          </div>

          {/* COURIER RATING CARD */}
          {delivery.status === 'delivered' && delivery.courier && (
            <div className="card" style={{ marginBottom: '20px', borderRadius: '20px', padding: '24px' }}>
              <h3 style={{ marginBottom: '12px' }}>
                Rate Your Courier
              </h3>
              
              {delivery.ratingGiven || ratingSubmitted ? (
                <div style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: '32px', color: '#facc15', marginBottom: '10px' }}>
                    {'★'.repeat(delivery.ratingGiven || ratingInput)}
                    {'☆'.repeat(5 - (delivery.ratingGiven || ratingInput))}
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    Thank you! You rated {delivery.courier} {(delivery.ratingGiven || ratingInput)} stars.
                  </p>
                  {(delivery.ratingComment || commentInput) && (
                    <div style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      background: 'var(--hover-bg)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontStyle: 'italic',
                      color: 'var(--text-secondary)'
                    }}>
                      "{delivery.ratingComment || commentInput}"
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    How was your delivery experience with {delivery.courier}?
                  </p>
                  
                  {/* Star Rating Select */}
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          fontSize: '32px',
                          cursor: 'pointer',
                          color: star <= (hoverRating || ratingInput) ? '#facc15' : '#e5e7eb',
                          transition: 'color 0.15s ease'
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  
                  {/* Comment Input */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Leave a comment (optional)
                    </label>
                    <textarea
                      placeholder="Share details of your experience..."
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      rows="3"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        background: 'var(--card-background)',
                        color: 'var(--text-primary)',
                        fontSize: '13px',
                        resize: 'vertical',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <button
                    className="btn btn-primary"
                    disabled={ratingInput === 0}
                    onClick={() => {
                      rateCourier(delivery.id, ratingInput, commentInput);
                      setRatingSubmitted(true);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 0',
                      borderRadius: '10px',
                      backgroundColor: ratingInput === 0 ? 'var(--border-color)' : '#2563eb',
                      borderColor: ratingInput === 0 ? 'var(--border-color)' : '#2563eb',
                      fontWeight: '600',
                      cursor: ratingInput === 0 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Submit Rating
                  </button>
                </div>
              )}
            </div>
          )}

          {/* QUICK ACTIONS */}
          <div className="card" style={{ marginBottom: '20px', borderRadius: '20px' }}>
            <h3 style={{ marginBottom: '20px' }}>
              Quick Actions
            </h3>

            <button
              className="btn btn-outline"
              style={{
                width: '100%',
                marginBottom: '10px',
                borderRadius: '10px'
              }}
            >
              <a href="mailto:support@deliverx.ma" style={{ textDecoration: 'none', color: 'inherit' }}>
                ✉️ {t('contactSupport') || 'Contact Support'}
              </a>
            </button>

            {delivery.status !== 'cancelled' && delivery.status !== 'delivered' && (
              <button
                className="btn btn-outline"
                style={{
                  width: '100%',
                  color: 'red',
                  borderRadius: '10px'
                }}
                onClick={handleCancelDelivery}
              >
                {t('cancelDelivery') || 'Cancel Delivery'}
              </button>
            )}
          </div>

          {/* ETA */}
          <div
            className="card"
            style={{
              border: '2px solid var(--primary-light)',
              background: darkMode ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff',
              textAlign: 'center',
              borderRadius: '20px'
            }}
          >
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
              {t('estimatedDelivery') || 'Estimated Arrival'}
            </p>

            <h1
              style={{
                margin: '10px 0',
                fontSize: '38px',
                color: 'var(--text-primary)',
              }}
            >
              {delivery.status === 'delivered' ? 'Delivered' : delivery.status === 'cancelled' ? 'Cancelled' : 'Today'}
            </h1>

            <strong style={{ color: 'var(--text-primary)' }}>
              {delivery.status === 'delivered' 
                ? 'Completed' 
                : delivery.status === 'cancelled' 
                ? 'None' 
                : (delivery.courierArrival ? `by ${delivery.courierArrival}` : 'Waiting pickup')}
            </strong>
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div className="card" style={{ borderRadius: '20px' }}>
        <h2 style={{ marginBottom: '30px' }}>
          {t('deliveryTimeline') || 'Delivery Journey'}
        </h2>

        {timeline.map((step, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              gap: '20px',
              marginBottom: '35px',
              position: 'relative',
            }}
          >
            {/* ICON */}
            <div
              style={{
                width: '40px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step.cancelled
                    ? '#ef4444'
                    : step.completed
                    ? '#16a34a'
                    : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                }}
              >
                {step.cancelled ? '✗' : step.completed ? '✓' : ''}
              </div>

              {index !== timeline.length - 1 && (
                <div
                  style={{
                    width: '2px',
                    flex: 1,
                    background: step.completed
                      ? '#16a34a'
                      : '#e5e7eb',
                    minHeight: '50px',
                  }}
                />
              )}
            </div>

            {/* CONTENT */}
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <h3 style={{ color: step.cancelled ? '#ef4444' : 'inherit' }}>{step.title}</h3>

                {step.current && (
                  <span
                    style={{
                      border: '1px solid #2563eb',
                      color: '#2563eb',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                    }}
                  >
                    Current
                  </span>
                )}
              </div>

              <p
                style={{
                  color: 'gray',
                  margin: '6px 0',
                  fontSize: '13px'
                }}
              >
                {step.description}
              </p>

              <small style={{ color: '#94a3b8' }}>
                🕒 {step.time}
              </small>
            </div>
          </div>
        ))}
      </div>

      <ChatPopup
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />

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
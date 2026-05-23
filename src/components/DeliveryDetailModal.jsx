import React, { useEffect } from 'react';
import StatusBadge from './StatusBadge';
import {
  FaTimes,
  FaMapMarkerAlt,
  FaBox,
  FaUser,
  FaMotorcycle,
  FaPhone,
  FaRoute,
  FaLock,
  FaKey,
  FaCreditCard,
} from 'react-icons/fa';

const PAYMENT_LABELS = {
  pending: { label: 'Awaiting payment', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
  held: { label: 'Held in escrow', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
  released: { label: 'Released', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  refunded: { label: 'Refunded', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
};

const buildTimeline = (delivery) => {
  if (delivery.timeline?.length) return delivery.timeline;

  const date = delivery.date || '—';
  const time = delivery.time || '';
  const stamp = time ? `${date} ${time}` : date;
  const status = delivery.status;

  const steps = [
    { step: 'Order created', date: stamp, active: true },
    { step: 'Waiting for courier', date: stamp, active: ['waiting-courier', 'accepted', 'paid', 'picked-up', 'in-transit', 'delivered'].includes(status) },
    { step: 'Courier assigned', date: delivery.courier ? stamp : '—', active: ['accepted', 'paid', 'picked-up', 'in-transit', 'delivered'].includes(status) },
    { step: 'Payment secured', date: delivery.paymentStatus === 'held' || delivery.paymentStatus === 'released' ? stamp : '—', active: ['paid', 'picked-up', 'in-transit', 'delivered'].includes(status) },
    { step: 'In transit', date: ['in-transit', 'delivered'].includes(status) ? stamp : '—', active: ['in-transit', 'delivered'].includes(status) },
    { step: 'Delivered', date: status === 'delivered' ? stamp : '—', active: status === 'delivered' },
  ];

  return steps;
};

const DetailRow = ({ label, value, highlight }) => (
  <div className="delivery-detail-row">
    <span className="delivery-detail-label">{label}</span>
    <span className={`delivery-detail-value ${highlight ? 'highlight' : ''}`}>{value || '—'}</span>
  </div>
);

const DeliveryDetailModal = ({ delivery, onClose, role = 'admin' }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!delivery) return null;

  const pickup = delivery.pickup || delivery.from || delivery.address || '—';
  const destination = delivery.destination || delivery.to || '—';
  const courierName = delivery.courier || delivery.Courier || null;
  const amount = delivery.amount ?? delivery.total ?? 0;
  const commission = delivery.commission ?? amount * 0.15;
  const courierShare = delivery.netAmount ?? amount - commission;
  const phone = delivery.phone || delivery.recipientPhone || delivery.pickupPhone;
  const paymentKey = delivery.paymentStatus || (delivery.status === 'delivered' ? 'released' : 'pending');
  const paymentStyle = PAYMENT_LABELS[paymentKey] || PAYMENT_LABELS.pending;
  const timeline = buildTimeline(delivery);
  const mapQuery = encodeURIComponent(destination);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="delivery-detail-backdrop" onClick={handleBackdrop} role="presentation">
      <div className="delivery-detail-modal" role="dialog" aria-labelledby="delivery-detail-title">
        <div className="delivery-detail-header">
          <div>
            <p className="delivery-detail-eyebrow">Delivery order</p>
            <h2 id="delivery-detail-title" className="delivery-detail-id">{delivery.id}</h2>
            <div className="delivery-detail-badges">
              <StatusBadge status={delivery.status} />
              <span
                className="delivery-payment-pill"
                style={{ color: paymentStyle.color, background: paymentStyle.bg }}
              >
                {paymentStyle.label}
              </span>
            </div>
          </div>
          <button type="button" className="delivery-detail-close" onClick={onClose} aria-label="Close">
            <FaTimes />
          </button>
        </div>

        <div className="delivery-detail-body">
          <section className="delivery-detail-route">
            <div className="delivery-detail-route-title">
              <FaRoute /> Route
            </div>
            <div className="delivery-detail-route-flow">
              <div className="delivery-route-stop pickup">
                <FaMapMarkerAlt />
                <div>
                  <span className="stop-label">Pickup</span>
                  <span className="stop-address">{pickup}</span>
                </div>
              </div>
              <div className="delivery-route-line" />
              <div className="delivery-route-stop dropoff">
                <FaMapMarkerAlt />
                <div>
                  <span className="stop-label">Drop-off</span>
                  <span className="stop-address">{destination}</span>
                </div>
              </div>
            </div>
          </section>

          <div className="delivery-detail-grid">
            <section className="delivery-detail-card">
              <h3>
                <FaUser /> Customer & contacts
              </h3>
              <DetailRow label="Customer" value={delivery.customer} />
              <DetailRow label="Recipient phone" value={delivery.phone || delivery.recipientPhone} />
              <DetailRow label="Pickup contact" value={delivery.pickupContact} />
              <DetailRow label="Pickup phone" value={delivery.pickupPhone} />
            </section>

            <section className="delivery-detail-card">
              <h3>
                <FaMotorcycle /> Courier
              </h3>
              {courierName ? (
                <>
                  <DetailRow label="Name" value={courierName} />
                  <DetailRow label="Phone" value={delivery.courierPhone} />
                  <DetailRow label="Vehicle" value={delivery.courierVehicle} />
                  <DetailRow label="Rating" value={delivery.courierRating ? `${delivery.courierRating} ★` : null} />
                  <DetailRow label="ETA" value={delivery.courierArrival} />
                </>
              ) : (
                <p className="delivery-detail-empty">No courier assigned yet</p>
              )}
            </section>

            <section className="delivery-detail-card">
              <h3>
                <FaBox /> Package
              </h3>
              <DetailRow label="Type" value={delivery.packageType || delivery.type} />
              <DetailRow label="Weight" value={delivery.weight} />
              <DetailRow label="Dimensions" value={delivery.dimensions} />
              <DetailRow label="Priority" value={delivery.priority} />
              {delivery.instructions && (
                <div className="delivery-detail-notes">
                  <span className="delivery-detail-label">Instructions</span>
                  <p>{delivery.instructions}</p>
                </div>
              )}
              {delivery.notes && !delivery.instructions && (
                <div className="delivery-detail-notes">
                  <span className="delivery-detail-label">Notes</span>
                  <p>{delivery.notes}</p>
                </div>
              )}
            </section>

            <section className="delivery-detail-card delivery-detail-finance">
              <h3>
                <FaCreditCard /> Payment (MAD)
              </h3>
              <DetailRow label="Total" value={`${Number(amount).toFixed(2)} MAD`} highlight />
              {role === 'admin' && (
                <>
                  <DetailRow label="Platform fee (15%)" value={`${Number(commission).toFixed(2)} MAD`} />
                  <DetailRow label="Courier share (85%)" value={`${Number(courierShare).toFixed(2)} MAD`} />
                </>
              )}
              {role === 'courier' && (
                <DetailRow label="Your earnings" value={`${Number(courierShare).toFixed(2)} MAD`} highlight />
              )}
              {delivery.paymentMethod && (
                <DetailRow label="Method" value={delivery.paymentMethod} />
              )}
              {delivery.otp && (
                <div className="delivery-otp-box">
                  <FaKey />
                  <div>
                    <span>Delivery OTP</span>
                    <strong>{delivery.otp}</strong>
                  </div>
                </div>
              )}
              {delivery.paymentStatus === 'held' && (
                <p className="delivery-escrow-hint">
                  <FaLock size={12} /> Funds locked until OTP confirmation
                </p>
              )}
            </section>
          </div>

          {delivery.items?.length > 0 && (
            <section className="delivery-detail-card delivery-detail-full">
              <h3>Items</h3>
              <ul className="delivery-items-list">
                {delivery.items.map((item, i) => (
                  <li key={i}>
                    <span>{item.name}</span>
                    <span>×{item.qty}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="delivery-detail-card delivery-detail-full">
            <h3>Tracking timeline</h3>
            <div className="delivery-timeline">
              {timeline.map((step, i) => (
                <div
                  key={i}
                  className={`delivery-timeline-step ${step.active !== false ? 'active' : ''}`}
                >
                  <div className="delivery-timeline-dot" />
                  <div>
                    <strong>{step.step}</strong>
                    <span>{step.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="delivery-detail-footer">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          {phone && (
            <a href={`tel:${phone}`} className="btn btn-outline">
              <FaPhone /> Call
            </a>
          )}
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
          >
            <FaMapMarkerAlt /> View on map
          </a>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailModal;

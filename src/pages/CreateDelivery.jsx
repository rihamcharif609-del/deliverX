import React, { useMemo, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculatePrice } from '../utils/calculatePrice';
import { 
  FaPlusCircle, 
  FaMapMarkerAlt, 
  FaMapPin, 
  FaBox, 
  FaCalendarAlt, 
  FaCalculator, 
  FaCheckCircle, 
  FaExclamationCircle,
  FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa';

const initialFormData = {
  pickupAddress: '',
  pickupContactName: '',
  pickupContactPhone: '',
  deliveryAddress: '',
  recipientName: '',
  recipientPhone: '',
  packageType: 'documents',
  packageWeight: '',
  packageDimensions: '',
  declaredValue: '',
  deliveryDate: '',
  deliveryTime: '',
  instructions: '',
  priority: 'standard',
};

const CreateDelivery = () => {
  const { t } = useLanguage();
  const { createDelivery } = useDelivery();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next = {};

    if (!formData.pickupAddress.trim()) next.pickupAddress = 'Pickup address is required';
    if (!formData.pickupContactName.trim()) next.pickupContactName = 'Pickup contact name is required';
    if (!formData.pickupContactPhone.trim()) next.pickupContactPhone = 'Pickup phone is required';
    if (!formData.deliveryAddress.trim()) next.deliveryAddress = 'Delivery address is required';
    if (!formData.recipientName.trim()) next.recipientName = 'Recipient name is required';
    if (!formData.recipientPhone.trim()) next.recipientPhone = 'Recipient phone is required';

    const weight = parseFloat(formData.packageWeight);
    if (!formData.packageWeight || Number.isNaN(weight) || weight <= 0) {
      next.packageWeight = 'Enter a valid weight greater than 0';
    }

    if (!formData.deliveryDate) {
      next.deliveryDate = 'Delivery date is required';
    }

    const phonePattern = /^[+]?[\d\s-]{8,}$/;
    if (formData.pickupContactPhone && !phonePattern.test(formData.pickupContactPhone.trim())) {
      next.pickupContactPhone = 'Enter a valid phone number';
    }
    if (formData.recipientPhone && !phonePattern.test(formData.recipientPhone.trim())) {
      next.recipientPhone = 'Enter a valid phone number';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const priceQuote = useMemo(
    () =>
      calculatePrice({
        pickupAddress: formData.pickupAddress,
        deliveryAddress: formData.deliveryAddress,
        packageWeight: formData.packageWeight,
        priority: formData.priority,
      }),
    [
      formData.pickupAddress,
      formData.deliveryAddress,
      formData.packageWeight,
      formData.priority,
    ]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitError('');
    setLoading(true);

    try {
      await createDelivery({
        ...formData,
        calculatedAmount: priceQuote.total,
        distanceKm: priceQuote.distanceKm,
      });
      navigate('/sender/deliveries');
    } catch (err) {
      const apiErrors = err.response?.data?.errors || {};
      const fieldMap = {
        pickup_address: 'pickupAddress',
        pickup_contact_name: 'pickupContactName',
        pickup_contact_phone: 'pickupContactPhone',
        delivery_address: 'deliveryAddress',
        recipient_name: 'recipientName',
        recipient_phone: 'recipientPhone',
        package_weight: 'packageWeight',
        delivery_date: 'deliveryDate',
        delivery_time: 'deliveryTime',
      };
      const nextErrors = {};

      Object.entries(apiErrors).forEach(([field, messages]) => {
        if (fieldMap[field]) {
          nextErrors[fieldMap[field]] = messages[0];
        }
      });

      setErrors((prev) => ({ ...prev, ...nextErrors }));
      setSubmitError(
        err.response?.data?.message ||
        'Delivery could not be created. Please check your information and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (field) =>
    errors[field] ? (
      <span className="field-error-message">
        <FaExclamationCircle style={{ fontSize: '11px' }} /> {errors[field]}
      </span>
    ) : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <MainLayout userRole="sender" activePage="create-delivery">
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaPlusCircle style={{ fontSize: '11px' }} />
            <span>CREATE SHIPMENT</span>
          </div>
          <h1 className="hero-banner-title">
            Create New Delivery
          </h1>
          <p className="hero-banner-subtitle">
            Fill in package and route details to generate automated price estimates and assign couriers instantly.
          </p>
        </div>
        <div className="hero-banner-actions">
          <button 
            type="button"
            className="hero-banner-btn-primary"
            onClick={() => navigate('/sender')}
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: 'none' }}
          >
            <FaArrowLeft /> Back to Dashboard
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="create-delivery-form">
        {submitError && (
          <div className="form-submit-error-banner">
            <FaExclamationCircle size={16} />
            <span>{submitError}</span>
          </div>
        )}

        {/* ===== SECTION 1: ROUTE LOCATIONS ===== */}
        <div className="dashboard-grid grid-5" style={{ gap: '24px', marginBottom: '24px' }}>
          
          {/* Pickup Location Card */}
          <div className="form-section-card">
            <div className="form-card-header">
              <div className="form-card-icon-badge pickup">
                <FaMapMarkerAlt />
              </div>
              <div>
                <h3>{t('pickupLocation') || 'Pickup Location'}</h3>
                <p>Origin address & contact details</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="pickupAddress">Pickup Address *</label>
              <input
                id="pickupAddress"
                type="text"
                name="pickupAddress"
                className={`form-control ${errors.pickupAddress ? 'has-error' : ''}`}
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="e.g. Maarif, Casablanca"
              />
              {renderError('pickupAddress')}
            </div>

            <div className="form-group">
              <label htmlFor="pickupContactName">Pickup Contact Name *</label>
              <input
                id="pickupContactName"
                type="text"
                name="pickupContactName"
                className={`form-control ${errors.pickupContactName ? 'has-error' : ''}`}
                value={formData.pickupContactName}
                onChange={handleChange}
                placeholder="Sender or pickup contact name"
              />
              {renderError('pickupContactName')}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="pickupContactPhone">Pickup Contact Phone *</label>
              <input
                id="pickupContactPhone"
                type="tel"
                name="pickupContactPhone"
                className={`form-control ${errors.pickupContactPhone ? 'has-error' : ''}`}
                value={formData.pickupContactPhone}
                onChange={handleChange}
                placeholder="e.g. +212 612345678"
              />
              {renderError('pickupContactPhone')}
            </div>
          </div>

          {/* Delivery Location Card */}
          <div className="form-section-card">
            <div className="form-card-header">
              <div className="form-card-icon-badge destination">
                <FaMapPin />
              </div>
              <div>
                <h3>{t('deliveryLocation') || 'Delivery Location'}</h3>
                <p>Destination address & recipient details</p>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address *</label>
              <input
                id="deliveryAddress"
                type="text"
                name="deliveryAddress"
                className={`form-control ${errors.deliveryAddress ? 'has-error' : ''}`}
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="e.g. Agdal, Rabat"
              />
              {renderError('deliveryAddress')}
            </div>

            <div className="form-group">
              <label htmlFor="recipientName">Recipient Name *</label>
              <input
                id="recipientName"
                type="text"
                name="recipientName"
                className={`form-control ${errors.recipientName ? 'has-error' : ''}`}
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Person receiving the package"
              />
              {renderError('recipientName')}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="recipientPhone">Recipient Phone *</label>
              <input
                id="recipientPhone"
                type="tel"
                name="recipientPhone"
                className={`form-control ${errors.recipientPhone ? 'has-error' : ''}`}
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="e.g. +212 698765432"
              />
              {renderError('recipientPhone')}
            </div>
          </div>

        </div>

        {/* ===== SECTION 2: PACKAGE DETAILS ===== */}
        <div className="form-section-card" style={{ marginBottom: '24px' }}>
          <div className="form-card-header">
            <div className="form-card-icon-badge package">
              <FaBox />
            </div>
            <div>
              <h3>{t('packageDetails') || 'Package Specifications'}</h3>
              <p>Type, weight, value & handling notes</p>
            </div>
          </div>

          <div className="dashboard-grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="packageType">{t('packageType')} *</label>
              <select
                id="packageType"
                name="packageType"
                className="form-control"
                value={formData.packageType}
                onChange={handleChange}
              >
                <option value="documents">📄 Documents</option>
                <option value="parcel">📦 Standard Parcel</option>
                <option value="electronics">💻 Electronics</option>
                <option value="fragile">🍷 Fragile Items</option>
                <option value="food">🍕 Food & Goods</option>
                <option value="other">🏷️ Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="packageWeight">{t('weight')} (kg) *</label>
              <input
                id="packageWeight"
                type="number"
                name="packageWeight"
                className={`form-control ${errors.packageWeight ? 'has-error' : ''}`}
                value={formData.packageWeight}
                onChange={handleChange}
                placeholder="e.g. 1.5"
                min="0.1"
                step="0.1"
              />
              {renderError('packageWeight')}
            </div>

            <div className="form-group">
              <label htmlFor="packageDimensions">Dimensions (L × W × H cm)</label>
              <input
                id="packageDimensions"
                type="text"
                name="packageDimensions"
                className="form-control"
                value={formData.packageDimensions}
                onChange={handleChange}
                placeholder="e.g. 30 × 20 × 15"
              />
            </div>

            <div className="form-group">
              <label htmlFor="declaredValue">Declared Value (MAD)</label>
              <input
                id="declaredValue"
                type="number"
                name="declaredValue"
                className="form-control"
                value={formData.declaredValue}
                onChange={handleChange}
                placeholder="Optional value for insurance"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label htmlFor="instructions">Special Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              className="form-control"
              rows="3"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special handling instructions for the courier..."
            />
          </div>
        </div>

        {/* ===== SECTION 3: SCHEDULE & PREFERENCES ===== */}
        <div className="form-section-card" style={{ marginBottom: '24px' }}>
          <div className="form-card-header">
            <div className="form-card-icon-badge schedule">
              <FaCalendarAlt />
            </div>
            <div>
              <h3>Schedule & Preferences</h3>
              <p>Delivery date, preferred time & urgency level</p>
            </div>
          </div>

          <div className="dashboard-grid grid-3" style={{ gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="deliveryDate">Delivery Date *</label>
              <input
                id="deliveryDate"
                type="date"
                name="deliveryDate"
                className={`form-control ${errors.deliveryDate ? 'has-error' : ''}`}
                value={formData.deliveryDate}
                onChange={handleChange}
                min={today}
              />
              {renderError('deliveryDate')}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Preferred Delivery Time</label>
              <input
                id="deliveryTime"
                type="time"
                name="deliveryTime"
                className="form-control"
                value={formData.deliveryTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Speed & Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="standard">⚡ Standard Delivery</option>
                <option value="express">🚀 Express Delivery (+Surcharge)</option>
                <option value="scheduled">📅 Scheduled Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* ===== SECTION 4: AUTOMATED PRICE ESTIMATOR ===== */}
        <div className="form-price-estimator-card" style={{ marginBottom: '30px' }}>
          <div className="estimator-header">
            <div className="estimator-title-group">
              <FaCalculator className="estimator-icon" />
              <div>
                <h3>Delivery Price Estimate</h3>
                <p>Instant automated fee breakdown based on distance, weight and urgency</p>
              </div>
            </div>
            <div className="estimator-total-badge">
              <span>Fee Total:</span>
              <strong>{priceQuote.total.toFixed(2)} MAD</strong>
            </div>
          </div>

          <div className="estimator-body">
            {formData.pickupAddress.trim() && formData.deliveryAddress.trim() ? (
              <div className="estimator-distance-pill">
                <FaShieldAlt style={{ color: '#2563eb' }} />
                <span>Estimated Distance: <strong>{priceQuote.distanceKm} km</strong></span>
              </div>
            ) : (
              <p className="estimator-hint">
                💡 Enter pickup and delivery addresses above to calculate distance fee.
              </p>
            )}

            <div className="estimator-breakdown-grid">
              <div className="breakdown-item">
                <span className="breakdown-label">Base Fee</span>
                <span className="breakdown-value">{priceQuote.breakdown.base.toFixed(2)} MAD</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Distance ({priceQuote.distanceKm} km × 2 MAD)</span>
                <span className="breakdown-value">{priceQuote.breakdown.distance.toFixed(2)} MAD</span>
              </div>
              {priceQuote.breakdown.weight > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-label">Weight Surcharge</span>
                  <span className="breakdown-value">{priceQuote.breakdown.weight.toFixed(2)} MAD</span>
                </div>
              )}
              {priceQuote.breakdown.express > 0 && (
                <div className="breakdown-item">
                  <span className="breakdown-label">Express Surcharge</span>
                  <span className="breakdown-value">{priceQuote.breakdown.express.toFixed(2)} MAD</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== FORM ACTIONS ===== */}
        <div className="form-action-buttons">
          <button
            type="button"
            className="dashboard-btn-outline"
            onClick={() => navigate('/sender')}
            disabled={loading}
            style={{ width: 'auto', padding: '14px 28px' }}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="dashboard-btn-primary" 
            disabled={loading}
            style={{ width: 'auto', padding: '14px 36px', fontSize: '15px' }}
          >
            {loading ? <LoadingSpinner inline label="Creating Request..." size={16} /> : (
              <>
                <FaCheckCircle /> {t('submitRequest') || 'Submit Delivery Request'}
              </>
            )}
          </button>
        </div>
      </form>
    </MainLayout>
  );
};

export default CreateDelivery;


import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    createDelivery(formData);
    navigate('/sender/deliveries');
  };

  const renderError = (field) =>
    errors[field] ? (
      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>
        {errors[field]}
      </span>
    ) : null;

  const today = new Date().toISOString().split('T')[0];

  return (
    <MainLayout userRole="sender" activePage="create-delivery">
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('createDelivery')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('createDeliveryDesc')}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-2" style={{ gap: '30px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>{t('pickupLocation')}</h3>

            <div className="form-group">
              <label htmlFor="pickupAddress">Pickup Address *</label>
              <input
                id="pickupAddress"
                type="text"
                name="pickupAddress"
                className="form-control"
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
                className="form-control"
                value={formData.pickupContactName}
                onChange={handleChange}
                placeholder="Sender or pickup contact"
              />
              {renderError('pickupContactName')}
            </div>

            <div className="form-group">
              <label htmlFor="pickupContactPhone">Pickup Contact Phone *</label>
              <input
                id="pickupContactPhone"
                type="tel"
                name="pickupContactPhone"
                className="form-control"
                value={formData.pickupContactPhone}
                onChange={handleChange}
                placeholder="e.g. +212 612345678"
              />
              {renderError('pickupContactPhone')}
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>{t('deliveryLocation')}</h3>

            <div className="form-group">
              <label htmlFor="deliveryAddress">Delivery Address *</label>
              <input
                id="deliveryAddress"
                type="text"
                name="deliveryAddress"
                className="form-control"
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
                className="form-control"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Who receives the package"
              />
              {renderError('recipientName')}
            </div>

            <div className="form-group">
              <label htmlFor="recipientPhone">Recipient Phone *</label>
              <input
                id="recipientPhone"
                type="tel"
                name="recipientPhone"
                className="form-control"
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="e.g. +212 698765432"
              />
              {renderError('recipientPhone')}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>{t('packageDetails')}</h3>

          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="packageType">{t('packageType')} *</label>
              <select
                id="packageType"
                name="packageType"
                className="form-control"
                value={formData.packageType}
                onChange={handleChange}
              >
                <option value="documents">Documents</option>
                <option value="parcel">Parcel</option>
                <option value="electronics">Electronics</option>
                <option value="fragile">Fragile items</option>
                <option value="food">Food</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="packageWeight">{t('weight')} (kg) *</label>
              <input
                id="packageWeight"
                type="number"
                name="packageWeight"
                className="form-control"
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
              <label htmlFor="declaredValue">Declared value (MAD)</label>
              <input
                id="declaredValue"
                type="number"
                name="declaredValue"
                className="form-control"
                value={formData.declaredValue}
                onChange={handleChange}
                placeholder="Optional insurance value"
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="instructions">Special Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              className="form-control"
              rows="4"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special instructions for the courier..."
            />
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Schedule & Preferences</h3>

          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label htmlFor="deliveryDate">Delivery Date *</label>
              <input
                id="deliveryDate"
                type="date"
                name="deliveryDate"
                className="form-control"
                value={formData.deliveryDate}
                onChange={handleChange}
                min={today}
              />
              {renderError('deliveryDate')}
            </div>

            <div className="form-group">
              <label htmlFor="deliveryTime">Delivery Time</label>
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
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="standard">Standard (2-3 hours)</option>
                <option value="express">Express (1 hour)</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate('/sender')}
          >
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {t('submitRequest')}
          </button>
        </div>
      </form>
    </MainLayout>
  );
};

export default CreateDelivery;

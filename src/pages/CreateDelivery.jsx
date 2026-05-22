import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';
import { useDelivery } from '../context/DeliveryContext';

const CreateDelivery = ({ navigateTo }) => {
  const { t } = useLanguage();
  const { createDelivery } = useDelivery();
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    packageWeight: '',
    packageDimensions: '',
    recipientName: '',
    recipientPhone: '',
    deliveryDate: '',
    deliveryTime: '',
    instructions: '',
    priority: 'standard'
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createDelivery(formData);
    navigate('/sender/deliveries');
  };

  return (
    <MainLayout userRole="sender" activePage="create-delivery" onNavigate={navigateTo}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>{t('createDelivery')}</h1>
        <p style={{ color: 'var(--text-secondary)' }}>{t('createDeliveryDesc')}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-2" style={{ gap: '30px' }}>
          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>{t('pickupLocation')}</h3>
            
            <div className="form-group">
              <label>Pickup Address *</label>
              <input
                type="text"
                name="pickupAddress"
                className="form-control"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter pickup address"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Name *</label>
              <input
                type="text"
                name="recipientName"
                className="form-control"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Contact Phone *</label>
              <input
                type="tel"
                name="recipientPhone"
                className="form-control"
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '20px' }}>{t('deliveryLocation')}</h3>
            
            <div className="form-group">
              <label>Delivery Address *</label>
              <input
                type="text"
                name="deliveryAddress"
                className="form-control"
                value={formData.deliveryAddress}
                onChange={handleChange}
                placeholder="Enter delivery address"
                required
              />
            </div>

            <div className="form-group">
              <label>Recipient Name *</label>
              <input
                type="text"
                name="recipientName"
                className="form-control"
                value={formData.recipientName}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

            <div className="form-group">
              <label>Recipient Phone *</label>
              <input
                type="tel"
                name="recipientPhone"
                className="form-control"
                value={formData.recipientPhone}
                onChange={handleChange}
                placeholder="Phone number"
                required
              />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>{t('packageDetails')}</h3>
          
          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label>{t('packageType')} *</label>
              <select 
                name="priority" 
                className="form-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="standard">Documents</option>
                <option value="express">Parcel</option>
                <option value="scheduled">Electronics</option>
                <option value="scheduled">Fragile items</option>
                <option value="scheduled">Food</option>
                <option value="scheduled">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label>{t('weight')} (kg) *</label>
              <input
                type="number"
                name="packageWeight"
                className="form-control"
                value={formData.packageWeight}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                required
              />
            </div>

            <div className="form-group">
              <label>Declared value ($)</label>
              <input
                type="number"
                name="pickupAddress"
                className="form-control"
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="Enter pickup address"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="instructions"
              className="form-control"
              rows="4"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special instructions for the courier..."
            ></textarea>
          </div>
        </div>

        <div className="card" style={{ marginTop: '30px' }}>
          <h3 style={{ marginBottom: '20px' }}>Schedule & Preferences</h3>
          
          <div className="grid grid-2" style={{ gap: '20px' }}>
            <div className="form-group">
              <label>Delivery Date *</label>
              <input
                type="date"
                name="deliveryDate"
                className="form-control"
                value={formData.deliveryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Delivery Time</label>
              <input
                type="time"
                name="deliveryTime"
                className="form-control"
                value={formData.deliveryTime}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select 
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

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="instructions"
              className="form-control"
              rows="4"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Any special instructions for the courier..."
            ></textarea>
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
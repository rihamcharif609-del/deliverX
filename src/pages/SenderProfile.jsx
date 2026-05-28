import { useLanguage } from '../context/LanguageContext';
import React, { useEffect, useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import StatusBadge from '../components/StatusBadge';

const SenderProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { deliveries, deliveriesLoading, deliveriesError, fetchDeliveries } = useDelivery();
  const profileData = useMemo(() => ({
    name: user?.name || 'Sender',
    email: user?.email || 'sender@deliverx.com',
    phone: user?.phone || '',
    photo: user?.profile_photo || null,
    avatar: (user?.name || 'Sender').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  }), [user]);
  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({ ...profileData });
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    fetchDeliveries('sender').catch(() => {});
  }, [fetchDeliveries]);

  useEffect(() => {
    setFormData({ ...profileData });
  }, [profileData]);

  const paidStatuses = new Set(['held', 'released', 'paid']);
  const totalDeliveries = deliveries.length;
  const totalSpent = deliveries.reduce((sum, delivery) => (
    paidStatuses.has(delivery.paymentStatus) ? sum + Number(delivery.amount || 0) : sum
  ), 0);
  const deliveredHistory = deliveries.filter((delivery) => delivery.status === 'delivered');

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        await updateProfile({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          profile_photo: reader.result,
        });
      } catch (err) {
        alert(err.response?.data?.message || 'Could not update profile photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleEdit = () => {
    setFormData({ ...profileData });
    setSaveError('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);

    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profile_photo: profileData.photo,
      });
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save profile changes.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({ ...profileData });
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <MainLayout userRole="sender" activePage="sender-profile" onNavigate={navigateTo} onProfileClick={onProfileClick}>
      <div className="profile-container">
        <div className="profile-header">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <div 
            className="profile-avatar-large" 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              cursor: 'pointer', 
              position: 'relative', 
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Click to upload profile photo"
          >
            {profileData.photo ? (
              <img src={profileData.photo} alt="Sender Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              profileData.avatar
            )}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              width: '100%',
              background: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              fontSize: '10px',
              padding: '4px 0',
              textAlign: 'center',
              fontWeight: '600'
            }}>
              EDIT
            </div>
          </div>
          <h1 className="profile-name">{isEditing ? formData.name : profileData.name}</h1>
          <div className="profile-role">Sender</div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{totalDeliveries}</div>
            <div className="profile-stat-label">Total Deliveries</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{totalSpent.toFixed(2)} MAD</div>
            <div className="profile-stat-label">Total Spent</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
            {!isEditing && (
              <button className="btn btn-primary" onClick={handleEdit}>
                Edit Profile
              </button>
            )}
          </div>

          {saveError && (
            <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
              {saveError}
            </div>
          )}

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <input type="text" value={profileData.name} disabled />
              )}
            </div>

            <div className="profile-field">
              <label>{t('email')}</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              ) : (
                <input type="email" value={profileData.email} disabled />
              )}
            </div>

            <div className="profile-field">
              <label>{t('phone')}</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+212 600-000000"
                />
              ) : (
                <input type="tel" value={profileData.phone || ''} placeholder="Not added yet" disabled />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? 'Saving...' : t('saveChanges')}
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Delivery History</span>
          </div>
          
          {deliveriesLoading && (
            <p style={{ color: 'var(--text-secondary)' }}>Loading delivery history...</p>
          )}
          {deliveriesError && (
            <p style={{ color: '#ef4444' }}>{deliveriesError}</p>
          )}
          {!deliveriesLoading && deliveredHistory.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>No delivered packages yet.</p>
          ) : (
            <div className="table-container" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Delivery ID</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Destination</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveredHistory.map((delivery) => (
                    <tr key={delivery.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px', fontWeight: '700' }}>{delivery.id}</td>
                      <td style={{ padding: '12px' }}>{delivery.date || delivery.createdAt?.slice(0, 10)}</td>
                      <td style={{ padding: '12px' }}>{delivery.destination || delivery.to}</td>
                      <td style={{ padding: '12px', color: '#10b981', fontWeight: '700' }}>
                        {Number(delivery.amount || 0).toFixed(2)} MAD
                      </td>
                      <td style={{ padding: '12px' }}>
                        <StatusBadge status={delivery.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SenderProfile;

import { useLanguage } from '../context/LanguageContext';
import React, { useMemo, useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { getAccountStorageKey, readStoredJson, writeStoredJson } from '../utils/accountStorage';

const SenderProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const storageKey = useMemo(() => getAccountStorageKey('senderProfile', user), [user]);
  const defaultProfile = useMemo(() => ({
    name: user?.name || 'Sender',
    email: user?.email || 'sender@deliverx.com',
    phone: user?.phone || '+212 600-000000',
    avatar: (user?.name || 'Sender').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
    totalDeliveries: 0,
    totalSpent: 0,
    photo: null
  }), [user]);
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(() => ({ ...defaultProfile, ...readStoredJson(storageKey, {}) }));

  const [formData, setFormData] = useState({ ...profileData });
  const fileInputRef = React.useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const updated = { ...profileData, photo: reader.result };
      setProfileData(updated);
      writeStoredJson(storageKey, updated);
    };
    reader.readAsDataURL(file);
  };

  const deliveryHistory = [
    { id: 'DEL001', date: '2024-03-10', status: 'delivered', amount: 45.99, to: 'Alice Johnson' },
    { id: 'DEL002', date: '2024-03-08', status: 'delivered', amount: 78.50, to: 'Bob Smith' },
    { id: 'DEL003', date: '2024-03-05', status: 'delivered', amount: 120.00, to: 'Carol Davis' },
    { id: 'DEL004', date: '2024-03-01', status: 'delivered', amount: 32.75, to: 'David Wilson' }
  ];

  const handleEdit = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated = { ...formData };
    setProfileData(updated);
    writeStoredJson(storageKey, updated);
    setIsEditing(false);
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
            <div className="profile-stat-value">{profileData.totalDeliveries}</div>
            <div className="profile-stat-label">Total Deliveries</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">${profileData.totalSpent.toFixed(2)}</div>
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
                />
              ) : (
                <input type="tel" value={profileData.phone} disabled />
              )}
            </div>
          </div>

          {isEditing && (
            <div className="profile-actions">
              <button className="btn btn-outline" onClick={handleCancel}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave}>
                {t('saveChanges')}
              </button>
            </div>
          )}
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Delivery History</span>
          </div>
          
          {deliveryHistory.map((delivery) => (
            <div key={delivery.id} className="history-item">
              <div>
                <div className="history-id">{delivery.id}</div>
                <div className="history-date">{delivery.date}</div>
              </div>
              <div>To: {delivery.to}</div>
              <div className="history-amount">${delivery.amount.toFixed(2)}</div>
              <div>
                <span className={`status-badge ${delivery.status}`}>
                  {delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default SenderProfile;

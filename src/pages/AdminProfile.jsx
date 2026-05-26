import { useLanguage } from '../context/LanguageContext';
import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';

const AdminProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('adminProfile');
      if (saved && saved !== 'undefined') return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading adminProfile", e);
    }
    return {
      name: 'John Admin',
      email: 'admin@deliverx.com',
      phone: '+1 (555) 123-4567',
      role: 'Administrator',
      joinedDate: 'January 15, 2024',
      avatar: 'A',
      photo: null
    };
  });

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
      localStorage.setItem('adminProfile', JSON.stringify(updated));
    };
    reader.readAsDataURL(file);
  };

  const stats = {
    totalUsers: 1234,
    totalDeliveries: 5678,
    activeCouriers: 156,
    totalRevenue: 45678
  };

  const handleEdit = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    const updated = { ...formData };
    setProfileData(updated);
    localStorage.setItem('adminProfile', JSON.stringify(updated));
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
    <MainLayout userRole="admin" activePage="admin-profile" onNavigate={navigateTo} onProfileClick={onProfileClick}>
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
              <img src={profileData.photo} alt="Admin Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
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
          <div className="profile-role">{profileData.role}</div>
          <div className="verification-badge approved">
            ✅ Verified Account
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.totalUsers.toLocaleString()}</div>
            <div className="profile-stat-label">Total Users</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.totalDeliveries.toLocaleString()}</div>
            <div className="profile-stat-label">Total Deliveries</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.activeCouriers}</div>
            <div className="profile-stat-label">Active Couriers</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">${stats.totalRevenue.toLocaleString()}</div>
            <div className="profile-stat-label">Total Revenue</div>
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

            <div className="profile-field">
              <label>Role</label>
              <input type="text" value={profileData.role} disabled />
            </div>

            <div className="profile-field">
              <label>Joined Date</label>
              <input type="text" value={profileData.joinedDate} disabled />
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
      </div>
    </MainLayout>
  );
};

export default AdminProfile;
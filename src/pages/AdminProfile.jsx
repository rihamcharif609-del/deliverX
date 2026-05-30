import { useLanguage } from '../context/LanguageContext';
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const AdminProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const profileData = useMemo(() => ({
    name: user?.name || 'Admin',
    email: user?.email || 'admin@deliverx.com',
    phone: user?.phone || '',
    photo: user?.profile_photo || null,
    role: 'Administrator',
    joinedDate: user?.created_at?.slice(0, 10) || '',
    avatar: (user?.name || 'Admin').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  }), [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profileData });
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeliveries: 0,
    activeCouriers: 0,
    totalRevenue: 0,
  });
  const [statsError, setStatsError] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    setFormData({ ...profileData });
  }, [profileData]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsError('');
      setStatsLoading(true);

      try {
        const { data } = await axios.get(`${API_BASE_URL}/admin/dashboard`);
        const rows = data.data || {};
        setStats({
          totalUsers: Number(rows.total_users || 0),
          totalDeliveries: Number(rows.total_deliveries || 0),
          activeCouriers: Number(rows.active_couriers || 0),
          totalRevenue: Number(rows.total_revenue || 0),
        });
      } catch (err) {
        setStatsError(err.response?.data?.message || 'Could not load admin statistics.');
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

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
    setSaveError('');
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
            Verified Account
          </div>
        </div>

        {statsError && (
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>{statsError}</p>
        )}

        <SectionLoading loading={statsLoading} label="Loading admin statistics..." minHeight="120px">
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
            <div className="profile-stat-value">{stats.activeCouriers.toLocaleString()}</div>
            <div className="profile-stat-label">Active Couriers</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.totalRevenue.toFixed(2)} MAD</div>
            <div className="profile-stat-label">Total Revenue</div>
          </div>
        </div>
        </SectionLoading>

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
                <input type="tel" value={profileData.phone} placeholder="Not added yet" disabled />
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
              <button className="btn btn-outline" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <LoadingSpinner inline label="Saving..." size={14} /> : t('saveChanges')}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminProfile;

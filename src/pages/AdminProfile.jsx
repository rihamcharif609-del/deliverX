import React, { useEffect, useMemo, useState, useRef } from 'react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';
import {
  FaShieldAlt,
  FaUser,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaPhoneAlt,
  FaEnvelope,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaUsers,
  FaBoxes,
  FaTruck,
  FaWallet,
  FaLock,
  FaFileAlt
} from 'react-icons/fa';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const AdminProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef(null);

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
  const [saveSuccess, setSaveSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeliveries: 0,
    activeCouriers: 0,
    totalRevenue: 0,
  });
  const [statsError, setStatsError] = useState('');
  const [statsLoading, setStatsLoading] = useState(true);

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
        setSaveSuccess('Profile photo updated successfully!');
        setTimeout(() => setSaveSuccess(''), 3000);
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
      setSaveSuccess('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(''), 3000);
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
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <MainLayout userRole="admin" activePage="admin-profile" onNavigate={navigateTo} onProfileClick={onProfileClick}>
      {/* ===== HERO PAGE BANNER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaShieldAlt style={{ fontSize: '11px' }} />
            <span>ADMINISTRATOR PORTAL</span>
          </div>
          <h1 className="hero-banner-title">
            Administrator Profile & Settings ⚙️
          </h1>
          <p className="hero-banner-subtitle">
            Manage your administrative credentials, personal identity, profile photo, and overview platform statistics.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="form-submit-error-banner" style={{
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          marginBottom: '20px'
        }}>
          <FaCheckCircle size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {statsError && (
        <div className="form-submit-error-banner" style={{ marginBottom: '20px' }}>
          <FaExclamationCircle size={16} />
          <span>{statsError}</span>
        </div>
      )}

      {/* ===== AVATAR & IDENTITY CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handlePhotoUpload}
          />
          <div
            className="profile-avatar-wrapper"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '90px',
              height: '90px',
              borderRadius: '50%',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              boxShadow: '0 8px 24px rgba(37, 99, 235, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '800',
              fontSize: '28px',
              flexShrink: 0,
              border: '3px solid white'
            }}
            title="Click to upload profile photo"
          >
            {profileData.photo ? (
              <img
                src={profileData.photo}
                alt="Admin Profile"
                style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              profileData.avatar
            )}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.45)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 0.2s ease',
                color: 'white',
                fontSize: '10px',
                fontWeight: '700'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
            >
              <FaCamera size={15} style={{ marginBottom: '2px' }} />
              <span>UPLOAD</span>
            </div>
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
              <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {isEditing ? formData.name : profileData.name}
              </h2>
              <span style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#d97706',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <FaShieldAlt size={10} /> Administrator
              </span>
              <span style={{
                padding: '3px 10px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '700',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#10b981',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}>
                <FaCheckCircle size={10} /> Verified Account
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 14px 0' }}>
              DeliverX Platform Administrator · Full Access Authorization
            </p>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="dashboard-btn-primary btn-sm"
                onClick={() => fileInputRef.current?.click()}
                style={{ width: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FaCamera /> Upload new photo
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Recommended: 800×800 px. Supported: JPG, PNG, WEBP.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PLATFORM OVERVIEW METRIC CARDS ===== */}
      <SectionLoading loading={statsLoading} label="Loading admin platform statistics..." minHeight="120px">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '24px'
        }}>
          <div className="profile-stat-card" style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Users</span>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FaUsers />
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {stats.totalUsers.toLocaleString()}
            </div>
          </div>

          <div className="profile-stat-card" style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Deliveries</span>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FaBoxes />
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {stats.totalDeliveries.toLocaleString()}
            </div>
          </div>

          <div className="profile-stat-card" style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Active Couriers</span>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FaTruck />
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {stats.activeCouriers.toLocaleString()}
            </div>
          </div>

          <div className="profile-stat-card" style={{
            background: 'var(--card-background)',
            border: '1px solid var(--border-color)',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '12px',
            boxShadow: 'var(--shadow-sm)',
            transition: 'all 0.25s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Platform Revenue</span>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                color: '#f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px'
              }}>
                <FaWallet />
              </span>
            </div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              {stats.totalRevenue.toFixed(2)} MAD
            </div>
          </div>
        </div>
      </SectionLoading>

      {/* ===== PERSONAL INFORMATION CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge pickup">
            <FaUser />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Personal & Account Information
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Manage your administrator contact details and profile attributes
            </p>
          </div>
          {!isEditing && (
            <button
              type="button"
              className="dashboard-btn-outline btn-sm"
              onClick={handleEdit}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>

        {saveError && (
          <div className="form-submit-error-banner" style={{ marginBottom: '16px' }}>
            <FaExclamationCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        {!isEditing ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px'
          }}>
            <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <FaUser size={11} style={{ color: 'var(--primary-color)' }} /> Full Name
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', display: 'block' }}>
                {profileData.name}
              </strong>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <FaEnvelope size={11} style={{ color: 'var(--primary-color)' }} /> {t('email') || 'Email Address'}
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', display: 'block' }}>
                {profileData.email}
              </strong>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <FaPhoneAlt size={11} style={{ color: 'var(--primary-color)' }} /> {t('phone') || 'Phone Number'}
              </span>
              <strong style={{ fontSize: '14px', color: profileData.phone ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: '6px', display: 'block' }}>
                {profileData.phone || 'Not added yet'}
              </strong>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <FaShieldAlt size={11} style={{ color: 'var(--primary-color)' }} /> System Role
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', display: 'block' }}>
                {profileData.role}
              </strong>
            </div>

            <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <FaCalendarAlt size={11} style={{ color: 'var(--primary-color)' }} /> Member Since
              </span>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '6px', display: 'block' }}>
                {profileData.joinedDate || 'Platform Launch'}
              </strong>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px'
            }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="admin-name" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  Full Name *
                </label>
                <input
                  id="admin-name"
                  type="text"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Administrator Name"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="admin-email" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  {t('email') || 'Email Address'} *
                </label>
                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="admin@deliverx.com"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label htmlFor="admin-phone" style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', display: 'block' }}>
                  {t('phone') || 'Phone Number'}
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+212 600-000000"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--card-background)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  System Role
                </label>
                <div style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {profileData.role} (Restricted)
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px', display: 'block' }}>
                  Joined Date
                </label>
                <div style={{
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--hover-bg)',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {profileData.joinedDate || 'Platform Launch'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
              <button
                type="button"
                className="dashboard-btn-outline btn-sm"
                onClick={handleCancel}
                disabled={isSaving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <FaTimes /> Cancel
              </button>
              <button
                type="button"
                className="dashboard-btn-primary btn-sm"
                onClick={handleSave}
                disabled={isSaving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isSaving ? (
                  <LoadingSpinner inline label="Saving changes..." size={14} />
                ) : (
                  <>
                    <FaSave /> {t('saveChanges') || 'Save Changes'}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ===== SECURITY & PERMISSIONS CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge security" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <FaLock />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Administrator Permissions & Access Privileges
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Security clearings, platform controls, and authorized operational areas
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '14px'
        }}>
          {[
            { title: 'Global Platform Control', desc: 'Full administration access across senders, couriers, and deliveries.' },
            { title: 'Courier Verification Authority', desc: 'Authorized to review, approve, and reject official identity documents.' },
            { title: 'Financial & Escrow Auditing', desc: 'Oversight over platform payment flows, commission balances, and payouts.' },
            { title: 'Dispute Resolution & Security', desc: 'Permission to arbitrate delivery issues and manage user account standing.' }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--hover-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '13px' }}>
                <FaCheckCircle size={13} />
                <span>{item.title}</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminProfile;

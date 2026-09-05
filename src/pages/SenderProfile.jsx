import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import MainLayout from '../layouts/MainLayout';
import { useAuth } from '../context/AuthContext';
import { useDelivery } from '../context/DeliveryContext';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner, { SectionLoading } from '../components/LoadingSpinner';
import { 
  FaUser, 
  FaCamera, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaCheck, 
  FaLock, 
  FaMapMarkerAlt, 
  FaShieldAlt, 
  FaPhoneAlt, 
  FaEnvelope, 
  FaHistory, 
  FaBoxes,
  FaKey,
  FaCheckCircle,
  FaGlobe
} from 'react-icons/fa';

const SenderProfile = ({ navigateTo, onProfileClick }) => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { deliveries, deliveriesLoading, deliveriesError, fetchDeliveries } = useDelivery();
  
  const fileInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState('profile');

  // Stored location from localStorage for sender extra fields
  const [location, setLocation] = useState(() => localStorage.getItem(`sender_location_${user?.id}`) || 'Casablanca, Morocco');

  const profileData = useMemo(() => ({
    name: user?.name || 'Sender',
    email: user?.email || 'sender@deliverx.com',
    phone: user?.phone || '',
    photo: user?.profile_photo || null,
    avatar: (user?.name || 'Sender').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
  }), [user]);

  // Section edit states
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);

  const [formData, setFormData] = useState({
    name: profileData.name,
    email: profileData.email,
    phone: profileData.phone,
    location: location,
  });

  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');

  useEffect(() => {
    fetchDeliveries('sender').catch(() => {});
  }, [fetchDeliveries]);

  useEffect(() => {
    setFormData({
      name: profileData.name,
      email: profileData.email,
      phone: profileData.phone,
      location: location,
    });
  }, [profileData, location]);

  const paidStatuses = new Set(['held', 'released', 'paid']);
  const totalDeliveries = deliveries.length;
  const totalSpent = deliveries.reduce((sum, delivery) => (
    paidStatuses.has(delivery.paymentStatus) ? sum + Number(delivery.amount || 0) : sum
  ), 0);
  const deliveredHistory = deliveries.filter((delivery) => delivery.status === 'delivered');

  // Calculate profile completion percentage
  const completionItems = [
    { label: 'Setup account', percentage: 15, completed: true },
    { label: 'Upload your photo', percentage: 25, completed: Boolean(profileData.photo) },
    { label: 'Personal Info', percentage: 30, completed: Boolean(profileData.name && profileData.email && profileData.phone) },
    { label: 'Location & Address', percentage: 20, completed: Boolean(location.trim()) },
    { label: 'Delivery Activity', percentage: 10, completed: totalDeliveries > 0 },
  ];

  const completionPercentage = completionItems.reduce((sum, item) => sum + (item.completed ? item.percentage : 0), 0);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSavePersonal = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        profile_photo: profileData.photo,
      });
      setIsEditingPersonal(false);
      setSaveSuccess('Personal information updated!');
      setTimeout(() => setSaveSuccess(''), 3000);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Could not save personal info.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLocation = () => {
    setLocation(formData.location);
    if (user?.id) localStorage.setItem(`sender_location_${user.id}`, formData.location);
    setIsEditingLocation(false);
    setSaveSuccess('Location updated!');
    setTimeout(() => setSaveSuccess(''), 3000);
  };

  // Circular progress ring parameters
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionPercentage / 100) * circumference;

  return (
    <MainLayout userRole="sender" activePage="sender-profile" onNavigate={navigateTo} onProfileClick={onProfileClick}>
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '28px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            <FaUser style={{ fontSize: '11px' }} />
            <span>SENDER PROFILE</span>
          </div>
          <h1 className="hero-banner-title">
            Account & Profile Settings
          </h1>
          <p className="hero-banner-subtitle">
            Manage your personal information, profile photo, location, and account completion status.
          </p>
        </div>
      </div>

      {saveSuccess && (
        <div className="form-submit-error-banner" style={{ background: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}>
          <FaCheckCircle size={16} />
          <span>{saveSuccess}</span>
        </div>
      )}

      {/* ===== MAIN PROFILE LAYOUT ===== */}
      <div className="dashboard-grid grid-5" style={{ gap: '24px', alignItems: 'start' }}>
        
        {/* LEFT COLUMN: TABS & PROFILE EDIT CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* TOP AVATAR HEADER CARD */}
          <div className="form-section-card">
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
                  boxShadow: '0 8px 24px rgba(37,99,235,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: '800',
                  fontSize: '28px',
                  flexShrink: 0
                }}
                title="Click to upload profile photo"
              >
                {profileData.photo ? (
                  <img src={profileData.photo} alt={profileData.name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  profileData.avatar
                )}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0,0,0,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s ease',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: '700'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                >
                  <FaCamera size={16} />
                  <span>UPLOAD</span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>{profileData.name}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 14px' }}>Sender Account · Morocco</p>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button 
                    type="button"
                    className="dashboard-btn-primary btn-sm"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ width: 'auto' }}
                  >
                    <FaCamera /> Upload new photo
                  </button>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    At least 800×800 px recommended. JPG or PNG is allowed.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* INNER SUB-NAVIGATION TABS */}
          <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            {[
              { id: 'profile', label: 'Profile Details', icon: <FaUser /> },
              { id: 'security', label: 'Security & Access', icon: <FaLock /> },
              { id: 'activity', label: 'Delivery Activity', icon: <FaHistory /> },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`dashboard-btn-outline btn-sm ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#2563eb' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : 'var(--text-secondary)',
                  borderColor: activeTab === tab.id ? '#2563eb' : 'var(--border-color)',
                  borderRadius: '10px',
                  padding: '8px 18px',
                  fontWeight: '600'
                }}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <>
              {/* PERSONAL INFO CARD */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge pickup">
                    <FaUser />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Personal Info</h3>
                    <p>Name, email address and phone contact</p>
                  </div>
                  {!isEditingPersonal ? (
                    <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingPersonal(true)}>
                      <FaEdit /> Edit
                    </button>
                  ) : (
                    <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingPersonal(false)}>
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>

                {saveError && (
                  <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '14px' }}>
                    {saveError}
                  </div>
                )}

                {!isEditingPersonal ? (
                  <div className="dashboard-grid grid-3" style={{ gap: '16px' }}>
                    <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Full Name</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>{profileData.name}</strong>
                    </div>
                    <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Email Address</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>{profileData.email}</strong>
                    </div>
                    <div style={{ background: 'var(--hover-bg)', padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Phone Number</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '4px', display: 'block' }}>{profileData.phone || 'Not added yet'}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="dashboard-grid grid-3" style={{ gap: '16px' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="name">Full Name *</label>
                        <input
                          id="name"
                          type="text"
                          name="name"
                          className="form-control"
                          value={formData.name}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="email">Email Address *</label>
                        <input
                          id="email"
                          type="email"
                          name="email"
                          className="form-control"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="phone">Phone Number *</label>
                        <input
                          id="phone"
                          type="tel"
                          name="phone"
                          className="form-control"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+212 600-000000"
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                      <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingPersonal(false)}>Cancel</button>
                      <button className="dashboard-btn-primary btn-sm" onClick={handleSavePersonal} disabled={isSaving}>
                        {isSaving ? <LoadingSpinner inline label="Saving..." size={14} /> : <><FaSave /> Save Changes</>}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* LOCATION CARD */}
              <div className="form-section-card">
                <div className="form-card-header">
                  <div className="form-card-icon-badge destination">
                    <FaMapMarkerAlt />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3>Location & Default Address</h3>
                    <p>Primary pickup city and street address</p>
                  </div>
                  {!isEditingLocation ? (
                    <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingLocation(true)}>
                      <FaEdit /> Edit
                    </button>
                  ) : (
                    <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingLocation(false)}>
                      <FaTimes /> Cancel
                    </button>
                  )}
                </div>

                {!isEditingLocation ? (
                  <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <FaGlobe style={{ color: '#10b981', fontSize: '18px' }} />
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', fontWeight: '600', textTransform: 'uppercase' }}>Primary Location</span>
                      <strong style={{ fontSize: '14px', color: 'var(--text-primary)', marginTop: '2px', display: 'block' }}>{location}</strong>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="location">Primary Address & City</label>
                      <input
                        id="location"
                        type="text"
                        name="location"
                        className="form-control"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Maarif, Casablanca, Morocco"
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                      <button className="dashboard-btn-outline btn-sm" onClick={() => setIsEditingLocation(false)}>Cancel</button>
                      <button className="dashboard-btn-primary btn-sm" onClick={handleSaveLocation}>
                        <FaSave /> Save Changes
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <div className="form-section-card">
              <div className="form-card-header">
                <div className="form-card-icon-badge pickup">
                  <FaKey />
                </div>
                <div>
                  <h3>Security & Authentication</h3>
                  <p>Account password and session settings</p>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
                Your account is protected with encrypted authentication tokens and SSL connection.
              </p>
              <div className="dashboard-grid grid-2" style={{ gap: '16px' }}>
                <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaCheckCircle /> Password Protected
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Last updated recently</p>
                </div>
                <div style={{ background: 'var(--hover-bg)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaShieldAlt /> Active Web Session
                  </span>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>DeliverX Web Portal</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVITY HISTORY */}
          {activeTab === 'activity' && (
            <div className="form-section-card">
              <div className="form-card-header">
                <div className="form-card-icon-badge destination">
                  <FaBoxes />
                </div>
                <div>
                  <h3>Delivered Packages History</h3>
                  <p>Completed shipments and payments summary</p>
                </div>
              </div>
              
              <SectionLoading loading={deliveriesLoading} label="Loading delivery history..." minHeight="160px">
                {deliveriesError && (
                  <p style={{ color: '#ef4444' }}>{deliveriesError}</p>
                )}
                {!deliveriesLoading && deliveredHistory.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)' }}>No delivered packages yet.</p>
                ) : (
                  <div className="dashboard-table-card">
                    <table className="dashboard-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Date</th>
                          <th>Destination</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deliveredHistory.map((d) => (
                          <tr key={d.id} className="table-row-hover">
                            <td className="cell-id">{d.id}</td>
                            <td>{d.date || d.createdAt?.slice(0, 10)}</td>
                            <td>{d.destination || d.to}</td>
                            <td style={{ color: '#10b981', fontWeight: '800' }}>
                              {Number(d.amount || 0).toFixed(2)} MAD
                            </td>
                            <td>
                              <StatusBadge status={d.status} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </SectionLoading>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: "COMPLETE YOUR PROFILE" & ACCOUNT STATS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PROFILE COMPLETION GAUGE CARD (PINTEREST INSPIRED) */}
          <div className="form-section-card" style={{ textAlign: 'center', position: 'relative' }}>
            <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '18px' }}>
              Complete your profile
            </h3>

            {/* CIRCULAR PROGRESS GAUGE */}
            <div style={{ position: 'relative', width: '110px', height: '110px', margin: '0 auto 20px auto' }}>
              <svg width="110" height="110" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="var(--border-color)"
                  strokeWidth="8"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke="#10b981"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: '900',
                color: 'var(--text-primary)',
                letterSpacing: '-0.5px'
              }}>
                {completionPercentage}%
              </div>
            </div>

            {/* CHECKLIST ITEMS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              {completionItems.map((item, idx) => (
                <div 
                  key={idx} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    color: item.completed ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontWeight: item.completed ? '600' : '400'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.completed ? (
                      <FaCheck style={{ color: '#10b981', fontSize: '12px' }} />
                    ) : (
                      <FaTimes style={{ color: 'var(--border-color)', fontSize: '12px' }} />
                    )}
                    <span>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: item.completed ? '#10b981' : 'var(--text-secondary)', fontWeight: '700' }}>
                    {item.completed ? `${item.percentage}%` : `+${item.percentage}%`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ACCOUNT STATS CARD */}
          <div className="form-section-card">
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '16px' }}>
              Account Stats
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Orders</span>
                <strong style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>{totalDeliveries}</strong>
              </div>
              <div style={{ background: 'var(--hover-bg)', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '500' }}>Total Spent</span>
                <strong style={{ fontSize: '20px', fontWeight: '800', color: '#10b981' }}>{totalSpent.toFixed(2)} MAD</strong>
              </div>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
};

export default SenderProfile;


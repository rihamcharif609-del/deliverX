import { useLanguage } from '../context/LanguageContext';
import React, { useState, useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';

const CourierProfile = ({ navigateTo, onProfileClick, setVerified }) => {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('pending'); // pending, approved, rejected
  const [profileData, setProfileData] = useState({
    name: 'Mike Courier',
    email: 'courier@deliverx.com',
    phone: '+1 (555) 456-7890',
    address: '789 Courier Lane, San Francisco, CA 94105',
    vehicleType: 'Motorcycle',
    vehicleNumber: 'ABC-1234',
    cinNumber: 'CIN-987654321',
    driverLicense: 'DL-12345678',
    avatar: 'MC',
    completedDeliveries: 342,
    rating: 4.8,
    earnings: 12580.50
  });

  const [documents, setDocuments] = useState({
    cinImage: null,
    licenseImage: null,
    vehicleImage: null
  });

  const [formData, setFormData] = useState({ ...profileData });

  // Calculate profile completion
  const calculateCompletion = () => {
    let completed = 0;
    let total = 7;
    if (profileData.phone) completed++;
    if (profileData.address) completed++;
    if (profileData.vehicleType) completed++;
    if (profileData.vehicleNumber) completed++;
    if (profileData.cinNumber) completed++;
    if (profileData.driverLicense) completed++;
    if (documents.cinImage && documents.licenseImage && documents.vehicleImage) completed++;
    return Math.round((completed / total) * 100);
  };

  const [completion, setCompletion] = useState(calculateCompletion());

  useEffect(() => {
    const completionPercentage = calculateCompletion();
    setCompletion(completionPercentage);

    if (completionPercentage === 100 && documents.cinImage && documents.licenseImage && documents.vehicleImage) {
        setVerificationStatus('approved');
        if (setVerified) {
            setVerified(true);
            // --- HNA L-MOUCHKIL ---
            // Khass n-save-iwha bach l-Login i-3refha l-mara l-jaya
            localStorage.setItem('isCourierVerified', 'true');
        }
    }
}, [profileData, documents, setVerified]);

  const handleEdit = () => {
    setFormData({ ...profileData });
    setIsEditing(true);
  };

  const handleSave = () => {
    setProfileData({ ...formData });
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

  const handleDocumentUpload = (docType) => {
    // Simulate file upload
    alert(`Please upload ${docType} file`);
    setDocuments({
      ...documents,
      [docType]: 'uploaded_file.jpg'
    });
  };

  const stats = {
    earnings: profileData.earnings,
    rating: profileData.rating,
    completedDeliveries: profileData.completedDeliveries
  };

  return (
    <MainLayout userRole="courier" activePage="courier-profile" onNavigate={navigateTo} onProfileClick={onProfileClick} 
  >
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {profileData.avatar}
          </div>
          <h1 className="profile-name">{isEditing ? formData.name : profileData.name}</h1>
          <div className="profile-role">Courier</div>
          <div className={`verification-badge ${verificationStatus}`}>
            {verificationStatus === 'approved' && '✅ Verified Account'}
            {verificationStatus === 'pending' && '⏳ Pending Verification'}
            {verificationStatus === 'rejected' && '❌ Verification Failed'}
          </div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">${stats.earnings.toFixed(2)}</div>
            <div className="profile-stat-label">Total Earnings</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.rating} ⭐</div>
            <div className="profile-stat-label">Rating</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">{stats.completedDeliveries}</div>
            <div className="profile-stat-label">Completed Deliveries</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Profile Completion</span>
            <span>{completion}%</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${completion}%` }}></div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
            {!isEditing && verificationStatus !== 'approved' && (
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
              <input type="email" value={profileData.email} disabled />
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
              <label>Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="3"
                />
              ) : (
                <textarea value={profileData.address} disabled rows="3" />
              )}
            </div>

            <div className="profile-field">
              <label>Vehicle Type</label>
              {isEditing ? (
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                >
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Car">Car</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Bicycle">Bicycle</option>
                </select>
              ) : (
                <input type="text" value={profileData.vehicleType} disabled />
              )}
            </div>

            <div className="profile-field">
              <label>Vehicle Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={handleChange}
                />
              ) : (
                <input type="text" value={profileData.vehicleNumber} disabled />
              )}
            </div>

            <div className="profile-field">
              <label>CIN Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="cinNumber"
                  value={formData.cinNumber}
                  onChange={handleChange}
                />
              ) : (
                <input type="text" value={profileData.cinNumber} disabled />
              )}
            </div>

            <div className="profile-field">
              <label>Driver License Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="driverLicense"
                  value={formData.driverLicense}
                  onChange={handleChange}
                />
              ) : (
                <input type="text" value={profileData.driverLicense} disabled />
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
            <span>Required Documents</span>
          </div>

          <div className="profile-form-grid">
            <div className="document-upload" onClick={() => handleDocumentUpload('cinImage')}>
              <div className="document-icon">📄</div>
              <div className="document-name">CIN Card Image</div>
              <div className="document-status">
                {documents.cinImage ? '✅ Uploaded' : '⚠️ Not Uploaded'}
              </div>
            </div>

            <div className="document-upload" onClick={() => handleDocumentUpload('licenseImage')}>
              <div className="document-icon">📄</div>
              <div className="document-name">Driver License Image</div>
              <div className="document-status">
                {documents.licenseImage ? '✅ Uploaded' : '⚠️ Not Uploaded'}
              </div>
            </div>

            <div className="document-upload" onClick={() => handleDocumentUpload('vehicleImage')}>
              <div className="document-icon">📄</div>
              <div className="document-name">Vehicle Image</div>
              <div className="document-status">
                {documents.vehicleImage ? '✅ Uploaded' : '⚠️ Not Uploaded'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CourierProfile;
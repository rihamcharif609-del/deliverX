import React, { useState } from 'react';
import MainLayout from '../layouts/MainLayout';
import { useNavigate } from 'react-router-dom';

const UserProfile = ({ navigateTo, userId, userRole }) => {

  const navigate = useNavigate();

  // Simulate user data based on userId
  const [userData, setUserData] = useState(() => {
    if (userId === 'courier1' || (userId && userId.toString().includes('courier'))) {
      return {
        id: userId,
        type: 'courier',
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1 (555) 123-4567',
        role: 'courier',
        status: 'pending',
        vehicleType: 'Motorcycle',
        vehicleNumber: 'XYZ-7890',
        cinNumber: 'CIN-123456789',
        driverLicense: 'DL-98765432',
        completedDeliveries: 0,
        rating: 0,
        earnings: 0,
        documents: {
          cinImage: null,
          licenseImage: null,
          vehicleImage: null
        },
        joinedDate: '2024-03-01'
      };
    } else {
      return {
        id: userId,
        type: 'sender',
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone: '+1 (555) 987-6543',
        role: 'sender',
        status: 'active',
        totalDeliveries: 45,
        totalSpent: 1280.50,
        joinedDate: '2024-01-15'
      };
    }
  });

  const [verificationStatus, setVerificationStatus] = useState(userData.status || 'pending');

  const approveCourier = () => {
    setVerificationStatus('approved');
    alert('Courier has been approved!');
  };

  const rejectCourier = () => {
    setVerificationStatus('rejected');
    alert('Courier has been rejected.');
  };

  if (userData.type === 'courier') {
    return (
      <MainLayout userRole="admin" activePage="user-profile" onNavigate={navigateTo} 
  >
        <div className="profile-container">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </div>
            <h1 className="profile-name">{userData.name}</h1>
            <div className="profile-role">Courier</div>
            <div className={`verification-badge ${verificationStatus}`}>
              {verificationStatus === 'approved' && '✅ Verified'}
              {verificationStatus === 'pending' && '⏳ Pending'}
              {verificationStatus === 'rejected' && '❌ Rejected'}
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Personal Information</span>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Full Name</label>
                <input type="text" value={userData.name} disabled />
              </div>
              <div className="profile-field">
                <label>Email</label>
                <input type="email" value={userData.email} disabled />
              </div>
              <div className="profile-field">
                <label>Phone</label>
                <input type="tel" value={userData.phone} disabled />
              </div>
              <div className="profile-field">
                <label>Joined Date</label>
                <input type="text" value={userData.joinedDate} disabled />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Vehicle Information</span>
            </div>

            <div className="profile-form-grid">
              <div className="profile-field">
                <label>Vehicle Type</label>
                <input type="text" value={userData.vehicleType} disabled />
              </div>
              <div className="profile-field">
                <label>Vehicle Number</label>
                <input type="text" value={userData.vehicleNumber} disabled />
              </div>
              <div className="profile-field">
                <label>CIN Number</label>
                <input type="text" value={userData.cinNumber} disabled />
              </div>
              <div className="profile-field">
                <label>Driver License</label>
                <input type="text" value={userData.driverLicense} disabled />
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="profile-section-title">
              <span>Documents</span>
            </div>

            <div className="profile-form-grid">
              <div className="document-upload">
                <div className="document-icon">📄</div>
                <div className="document-name">CIN Card</div>
                <div className="document-status">Not Uploaded</div>
              </div>
              <div className="document-upload">
                <div className="document-icon">📄</div>
                <div className="document-name">Driver License</div>
                <div className="document-status">Not Uploaded</div>
              </div>
              <div className="document-upload">
                <div className="document-icon">📄</div>
                <div className="document-name">Vehicle Image</div>
                <div className="document-status">Not Uploaded</div>
              </div>
            </div>
          </div>

          {verificationStatus === 'pending' && (
            <div className="profile-actions">
              <button className="btn btn-danger" onClick={rejectCourier} style={{ backgroundColor: '#ef4444' }}>
                Reject Courier
              </button>
              <button className="btn btn-primary" onClick={approveCourier} style={{ backgroundColor: '#10b981' }}>
                Approve Courier
              </button>
            </div>
          )}
        </div>
      </MainLayout>
    );
  }

  // Sender view
  return (
    <MainLayout userRole="admin" activePage="user-profile" onNavigate={navigateTo}>
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {userData.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h1 className="profile-name">{userData.name}</h1>
          <div className="profile-role">Sender</div>
        </div>

        <div className="profile-stats-grid">
          <div className="profile-stat-card">
            <div className="profile-stat-value">{userData.totalDeliveries}</div>
            <div className="profile-stat-label">Total Deliveries</div>
          </div>
          <div className="profile-stat-card">
            <div className="profile-stat-value">${userData.totalSpent.toFixed(2)}</div>
            <div className="profile-stat-label">Total Spent</div>
          </div>
        </div>

        <div className="profile-section">
          <div className="profile-section-title">
            <span>Personal Information</span>
          </div>

          <div className="profile-form-grid">
            <div className="profile-field">
              <label>Full Name</label>
              <input type="text" value={userData.name} disabled />
            </div>
            <div className="profile-field">
              <label>Email</label>
              <input type="email" value={userData.email} disabled />
            </div>
            <div className="profile-field">
              <label>Phone</label>
              <input type="tel" value={userData.phone} disabled />
            </div>
            <div className="profile-field">
              <label>Joined Date</label>
              <input type="text" value={userData.joinedDate} disabled />
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="btn btn-outline" onClick={() => navigate(`/admin/users`)}>
            Back to Users
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default UserProfile;
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import StatusBadge from '../components/StatusBadge';
import {
  FaArrowLeft,
  FaUser,
  FaMotorcycle,
  FaBoxes,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaStar,
  FaWallet,
  FaShieldAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaCalendarAlt,
  FaIdCard
} from 'react-icons/fa';

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Mock data preserved exactly as defined
  const user = {
    id,
    name: 'Riham Charif',
    email: 'riham@gmail.com',
    phone: '+212 600000000',
    role: 'courier',
    status: 'active',
    joinDate: '2026-05-01',
    avatar: 'https://i.pravatar.cc/150?img=5',

    stats: {
      totalDeliveries: 45,
      completed: 38,
      pending: 5,
      cancelled: 2,
      earnings: 3200,
      rating: 4.8
    },

    verification: {
      cin: true,
      driverLicense: true,
      profileCompleted: true,
      approved: false
    },

    recentDeliveries: [
      {
        id: 'DEL001',
        status: 'delivered',
        date: '2026-05-04',
        amount: 120
      },
      {
        id: 'DEL002',
        status: 'pending',
        date: '2026-05-05',
        amount: 80
      }
    ]
  };

  const isCourier = user.role === 'courier';

  return (
    <MainLayout userRole="admin" activePage="users">
      {/* ===== HERO PAGE HEADER ===== */}
      <div className="dashboard-hero-banner" style={{ marginBottom: '24px' }}>
        <div className="hero-banner-content">
          <div className="hero-banner-tag">
            {isCourier ? <FaMotorcycle style={{ fontSize: '11px' }} /> : <FaUser style={{ fontSize: '11px' }} />}
            <span>USER ACCOUNT OVERVIEW</span>
          </div>
          <h1 className="hero-banner-title">
            {user.name}
          </h1>
          <p className="hero-banner-subtitle">
            Complete information, performance analytics, verification credentials, and delivery history.
          </p>
        </div>
        <div className="hero-banner-actions">
          <button
            type="button"
            className="dashboard-btn-outline"
            onClick={() => navigate('/admin/users')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <FaArrowLeft size={13} /> Back to Users
          </button>
        </div>
      </div>

      {/* ===== USER INFO CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <img
              src={user.avatar}
              alt="avatar"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                border: '3px solid white'
              }}
            />

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {user.name}
                </h2>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}>
                  {user.role}
                </span>
              </div>

              <div style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                alignItems: 'center'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FaEnvelope size={12} style={{ color: 'var(--primary-color)' }} /> {user.email}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FaPhoneAlt size={12} style={{ color: 'var(--primary-color)' }} /> {user.phone}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <FaCalendarAlt size={12} style={{ color: 'var(--primary-color)' }} /> Joined {user.joinDate}
                </span>
              </div>
            </div>
          </div>

          <div>
            <StatusBadge status={user.status} />
          </div>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Total Deliveries</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaBoxes size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.stats.totalDeliveries}</div>
        </div>

        <div className="profile-stat-card" style={{
          background: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Completed</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaCheckCircle size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.stats.completed}</div>
        </div>

        <div className="profile-stat-card" style={{
          background: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Pending</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaClock size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.stats.pending}</div>
        </div>

        <div className="profile-stat-card" style={{
          background: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Cancelled</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaTimesCircle size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.stats.cancelled}</div>
        </div>

        <div className="profile-stat-card" style={{
          background: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Earnings</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaWallet size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>${user.stats.earnings}</div>
        </div>

        <div className="profile-stat-card" style={{
          background: 'var(--card-background)',
          border: '1px solid var(--border-color)',
          borderRadius: '14px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)' }}>Rating</span>
            <span style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FaStar size={14} />
            </span>
          </div>
          <div style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-primary)' }}>{user.stats.rating} ⭐</div>
        </div>
      </div>

      {/* ===== VERIFICATION CARD ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge pickup">
            <FaShieldAlt />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Verification Checklist
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Document status and verification clearance
            </p>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {[
            { label: 'CIN Verified', verified: user.verification.cin },
            { label: 'Driver License', verified: user.verification.driverLicense },
            { label: 'Profile Completed', verified: user.verification.profileCompleted },
            { label: 'Approved by Admin', verified: user.verification.approved }
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--hover-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{item.label}</span>
              {item.verified ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '12px', fontWeight: '700' }}>
                  <FaCheckCircle /> Verified
                </span>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>
                  <FaTimesCircle /> Pending
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== RECENT DELIVERIES ===== */}
      <div className="form-section-card" style={{ marginBottom: '24px' }}>
        <div className="form-card-header" style={{ marginBottom: '20px' }}>
          <div className="form-card-icon-badge destination">
            <FaBoxes />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Recent Deliveries
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--text-secondary)' }}>
              Shipments dispatched or delivered
            </p>
          </div>
        </div>

        <div className="table-container dashboard-table-card">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {user.recentDeliveries.map((delivery) => (
                <tr key={delivery.id} className="table-row-hover">
                  <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>{delivery.id}</td>
                  <td>
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{delivery.date}</td>
                  <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>${delivery.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== ACTIONS ===== */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button type="button" className="dashboard-btn-primary">
          Approve Account
        </button>
        <button type="button" className="dashboard-btn-outline">
          Edit User
        </button>
        <button type="button" className="dashboard-btn-danger">
          Suspend User
        </button>
      </div>
    </MainLayout>
  );
};

export default UserDetails;

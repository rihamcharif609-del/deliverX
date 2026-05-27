import { FaBell, FaChevronDown, FaUser, FaCog, FaSignOutAlt, FaTimes, FaCheck, FaTruck, FaUserPlus, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from './SettingsPanel';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';

const Header = ({userRole = 'sender', darkMode, setDarkMode }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    getNotificationsForRole,
    markAsRead,
    markAllAsRead,
    deleteNotification: contextDeleteNotification,
  } = useDelivery();

  const roleNotifications = getNotificationsForRole(userRole);

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Modal notification state
  const [activeNotification, setActiveNotification] = useState(null);

  // Toast notification state for interactive action feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Autoclose toast after 3 seconds
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Click outside handlers
  useEffect(() => {
    if (!showNotifications) return;
    const handleOutsideClick = (e) => {
      const wrapper = document.querySelector('.notification-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showNotifications]);

  useEffect(() => {
    if (!showProfileMenu) return;
    const handleOutsideClick = (e) => {
      const wrapper = document.querySelector('.profile-wrapper');
      if (wrapper && !wrapper.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [showProfileMenu]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Notification action handlers
  const deleteNotification = (e, id) => {
    e.stopPropagation(); // Stop click from opening details modal
    contextDeleteNotification(id);
    if (activeNotification && activeNotification.id === id) {
      setActiveNotification(null);
    }
  };

  const handleNotificationClick = (notif) => {
    markAsRead(notif.id, userRole);
    setShowNotifications(false);

    if (notif.type === 'courier_request' && userRole === 'admin') {
      navigate(notif.path || '/admin/courier-verification');
      return;
    }

    if (notif.details) {
      setActiveNotification(notif);
      return;
    }

    if (notif.path) {
      navigate(notif.path);
      return;
    }

    setActiveNotification(notif);
  };

  const handleAcceptCourier = (name) => {
    setToastMessage(`Courier request from ${name} accepted successfully.`);
    contextDeleteNotification(activeNotification.id);
    setActiveNotification(null);
  };

  const handleRejectCourier = (name) => {
    setToastMessage(`Courier request from ${name} has been rejected.`);
    contextDeleteNotification(activeNotification.id);
    setActiveNotification(null);
  };

  const handleViewDelivery = (path) => {
    navigate(path);
    setActiveNotification(null);
  };

  const handleViewUser = (path) => {
    navigate(path);
    setActiveNotification(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('notification-modal-backdrop')) {
      setActiveNotification(null);
    }
  };

  const unreadCount = roleNotifications.filter((n) => !n.isRead).length;

  const renderListIcon = (type) => {
    switch (type) {
      case 'courier_request':
      case 'courier_accepted':
      case 'user_registered':
        return <FaUserPlus />;
      case 'delivery_completed':
      case 'delivery_created':
      case 'status_update':
      case 'delivery_refunded':
        return <FaTruck />;
      case 'payment_received':
      case 'payout_released':
      case 'courier_notify_paid':
      case 'courier_notify_refunded':
        return <FaCheck />;
      default:
        return <FaBell />;
    }
  };

  const roleAvatar = userRole === 'admin' ? 'A' : userRole === 'courier' ? 'C' : 'S';

  return (
    <header className="header">
      <div className="header-search">
        <span>🔍</span>
        <input type="text" placeholder={t('searchPlaceholder')} />
      </div>

      <div className="header-actions">
        {/* Notifications */}
        <div className="notification-wrapper">
          <button
            className="icon-button"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="dropdown-menu notification-menu">
              <div className="notification-menu-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read-btn" onClick={() => markAllAsRead(userRole)}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {roleNotifications.length === 0 ? (
                  <p style={{ padding: '20px', color: 'gray', margin: 0, fontSize: '13px', textAlign: 'center' }}>
                    No notifications for {userRole}
                  </p>
                ) : (
                  roleNotifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${!notif.isRead ? 'unread' : ''}`}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className={`notification-icon-wrapper ${notif.type}`}>
                        {renderListIcon(notif.type)}
                      </div>
                      
                      <div className="notification-item-content">
                        <div className="notification-item-title">{notif.text}</div>
                        <div className="notification-item-desc">{notif.description}</div>
                        <div className="notification-item-time">{notif.time}</div>
                      </div>

                      {!notif.isRead && <span className="notification-item-unread-dot" />}

                      <button 
                        className="notification-item-delete-btn" 
                        onClick={(e) => deleteNotification(e, notif.id)}
                        title="Dismiss notification"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="profile-wrapper">
          <button
            className="profile-button"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
          >
            <div className="user-avatar">{roleAvatar}</div>
            <FaChevronDown />
          </button>

          {showProfileMenu && (
            <div className="dropdown-menu profile-menu">
              <div className="dropdown-item" onClick={() => {
                if (userRole === 'admin') {
                  navigate('/admin/profile');
                } else if (userRole === 'sender') {
                  navigate('/sender/profile');
                } else if (userRole === 'courier') {
                  navigate('/courier/profile');
                }
              }} >
                <FaUser />
                <span>{t('profile')}</span>
              </div>

              <div className="dropdown-item" onClick={() => setShowSettings(true)} >
                <FaCog />
                <span>{t('settings')}</span>
              </div>

              <div
                className="dropdown-item logout"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>{t('logout')}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <SettingsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Centered Modern Detail Modal Popup */}
      {activeNotification && (
        <div className="notification-modal-backdrop" onClick={handleBackdropClick}>
          <div className="notification-modal">
            <div className="notification-modal-header">
              <span className="notification-modal-title">
                <FaBell style={{ color: 'var(--primary-color)' }} />
                Notification Details
              </span>
              <button 
                className="notification-modal-close-btn" 
                onClick={() => setActiveNotification(null)}
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="notification-modal-body">
              {activeNotification.type === 'courier_request' && (
                <>
                  <div className="notification-modal-type-icon courier_request">
                    <FaUserPlus />
                  </div>
                  <h4>Courier Request Details</h4>
                  <p className="modal-desc">{activeNotification.description}</p>
                  <div className="notification-modal-details-card">
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Applicant Name</span>
                      <span className="modal-detail-value">{activeNotification.details.name}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Vehicle Type</span>
                      <span className="modal-detail-value">{activeNotification.details.vehicle}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Experience</span>
                      <span className="modal-detail-value">{activeNotification.details.experience}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Rating</span>
                      <span className="modal-detail-value" style={{ color: '#fbbf24' }}>
                        {activeNotification.details.rating}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {activeNotification.type === 'delivery_completed' && activeNotification.details && (
                <>
                  <div className="notification-modal-type-icon delivery_completed">
                    <FaTruck />
                  </div>
                  <h4>Delivery Details</h4>
                  <p className="modal-desc">{activeNotification.description}</p>
                  <div className="notification-modal-details-card">
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Order Reference</span>
                      <span className="modal-detail-value">{activeNotification.details.orderId}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Customer Name</span>
                      <span className="modal-detail-value">{activeNotification.details.customer}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Destination</span>
                      <span className="modal-detail-value">{activeNotification.details.destination}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Driver Earnings</span>
                      <span className="modal-detail-value" style={{ color: '#34d399' }}>
                        {activeNotification.details.earnings}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {!activeNotification.details &&
                !['courier_request', 'user_registered'].includes(activeNotification.type) && (
                <>
                  <div className="notification-modal-type-icon delivery_completed">
                    {renderListIcon(activeNotification.type)}
                  </div>
                  <h4>{activeNotification.text}</h4>
                  <p className="modal-desc">{activeNotification.description}</p>
                  <p className="modal-desc" style={{ fontSize: '12px', opacity: 0.7 }}>
                    {activeNotification.time}
                  </p>
                </>
              )}

              {activeNotification.type === 'user_registered' && activeNotification.details && (
                <>
                  <div className="notification-modal-type-icon user_registered">
                    <FaUser />
                  </div>
                  <h4>User Information</h4>
                  <p className="modal-desc">{activeNotification.description}</p>
                  <div className="notification-modal-details-card">
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Full Name</span>
                      <span className="modal-detail-value">{activeNotification.details.name}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Email Address</span>
                      <span className="modal-detail-value">{activeNotification.details.email}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Role Assigned</span>
                      <span className="modal-detail-value">{activeNotification.details.role}</span>
                    </div>
                    <div className="modal-detail-row">
                      <span className="modal-detail-label">Registered At</span>
                      <span className="modal-detail-value">{activeNotification.details.dateJoined}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="notification-modal-actions">
              {activeNotification.type === 'courier_request' && (
                <>
                  <button 
                    className="modal-action-btn btn-reject" 
                    onClick={() => handleRejectCourier(activeNotification.details.name)}
                  >
                    Reject
                  </button>
                  <button 
                    className="modal-action-btn btn-accept" 
                    onClick={() => handleAcceptCourier(activeNotification.details.name)}
                  >
                    Accept
                  </button>
                </>
              )}

              {activeNotification.type === 'delivery_completed' && (
                <>
                  <button 
                    className="modal-action-btn btn-close" 
                    onClick={() => setActiveNotification(null)}
                  >
                    Close
                  </button>
                  <button 
                    className="modal-action-btn btn-primary" 
                    onClick={() => handleViewDelivery(activeNotification.path)}
                  >
                    View Delivery
                  </button>
                </>
              )}

              {activeNotification.type === 'user_registered' && (
                <>
                  <button 
                    className="modal-action-btn btn-close" 
                    onClick={() => setActiveNotification(null)}
                  >
                    Close
                  </button>
                  <button 
                    className="modal-action-btn btn-primary" 
                    onClick={() => handleViewUser(activeNotification.path)}
                  >
                    View User
                  </button>
                </>
              )}

              {!['courier_request', 'delivery_completed', 'user_registered'].includes(activeNotification.type) && (
                <>
                  <button
                    className="modal-action-btn btn-close"
                    onClick={() => setActiveNotification(null)}
                  >
                    Close
                  </button>
                  {activeNotification.path && (
                    <button
                      className="modal-action-btn btn-primary"
                      onClick={() => handleViewDelivery(activeNotification.path)}
                    >
                      View Details
                    </button>
                  )}
                </>
              )}

              {activeNotification.type === 'user_registered' && !activeNotification.details && activeNotification.path && (
                <>
                  <button
                    className="modal-action-btn btn-close"
                    onClick={() => setActiveNotification(null)}
                  >
                    Close
                  </button>
                  <button
                    className="modal-action-btn btn-primary"
                    onClick={() => handleViewUser(activeNotification.path || '/admin/users')}
                  >
                    View Users
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #1e293b, #0f172a)',
          border: '1px solid #334155',
          color: '#f8fafc',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.4)',
          zIndex: 10001,
          animation: 'modalScaleIn 0.2s ease-out',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '500',
          fontSize: '13px'
        }}>
          <span style={{ color: '#10b981', display: 'flex', alignItems: 'center' }}><FaCheck /></span> 
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
};

export default Header;

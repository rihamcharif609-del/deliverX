import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  FaThLarge, 
  FaBox, 
  FaPlusCircle, 
  FaSearchLocation, 
  FaUserCheck, 
  FaUsers, 
  FaTruck 
} from 'react-icons/fa';

const Sidebar = ({ userRole = 'sender' }) => {
  const menuItems = {
    admin: [
      { label: 'Dashboard', page: '/admin', icon: <FaThLarge /> },
      { label: 'All Deliveries', page: '/admin/deliveries', icon: <FaBox /> },
      { label: 'Courier Verification', page: '/admin/courier-verification', icon: <FaUserCheck /> },
      { label: 'Manage Users', page: '/admin/users', icon: <FaUsers /> },
    ],
    sender: [
      { label: 'Dashboard', page: '/sender', icon: <FaThLarge /> },
      { label: 'My Deliveries', page: '/sender/deliveries', icon: <FaBox /> },
      { label: 'Create Delivery', page: '/sender/create', icon: <FaPlusCircle /> },
      { label: 'Track Package', page: '/sender/tracking', icon: <FaSearchLocation /> },
    ],
    courier: [
      { label: 'Dashboard', page: '/courier', icon: <FaThLarge /> },
      { label: 'Available', page: '/courier/available', icon: <FaTruck /> },
      { label: 'My Deliveries', page: '/courier/deliveries', icon: <FaBox /> },
    ],
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const displayRole = user?.role || userRole || 'sender';
  const displayName = user?.name || 'User';
  const roleLabel = displayRole.charAt(0).toUpperCase() + displayRole.slice(1);
  const items = menuItems[displayRole] || menuItems.sender;

  const navigateToProfile = () => {
    if (displayRole === 'admin') navigate('/admin/profile');
    else if (displayRole === 'sender') navigate('/sender/profile');
    else if (displayRole === 'courier') navigate('/courier/profile');
  };

  const navigateToItem = (item) => {
    if (item.page === '/sender/tracking') {
      const deliveries = JSON.parse(localStorage.getItem('myDeliveries')) || [];
      navigate(deliveries.length === 1 ? `/sender/tracking/${deliveries[0].id}` : '/sender/tracking');
      return;
    }

    navigate(item.page);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="#2563eb"/>
            <path d="M6 14 L14 6 L22 14 L18 14 L18 22 L10 22 L10 14 Z" fill="white"/>
          </svg>
          <div className="sidebar-brand-text">
            <h2>DeliverX</h2>
            <p>{t('deliveryManagement')}</p>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {items.map((item) => {
            const isActive = location.pathname === item.page;
            const translatedLabel = 
              item.label === 'Dashboard' ? t('dashboard') :
              item.label === 'All Deliveries' ? t('allDeliveries') :
              item.label === 'My Deliveries' ? t('myDeliveries') :
              item.label === 'Courier Verification' ? t('courierVerification') :
              item.label === 'Manage Users' ? t('manageUsers') :
              item.label === 'Create Delivery' ? t('createDelivery') :
              item.label === 'Track Package' ? t('trackPackage') :
              item.label === 'Available' ? t('available') : item.label;

            return (
              <li
                key={item.page}
                className={isActive ? 'active' : ''}
                onClick={() => navigateToItem(item)}
              >
                <span className="sidebar-item-icon">{item.icon}</span>
                <span className="sidebar-item-label">{translatedLabel}</span>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar-footer" onClick={navigateToProfile}>
        <div className="user-info">
          <div className="user-avatar">
            {user?.profile_photo ? (
              <img
                src={user.profile_photo}
                alt={displayName}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            ) : (
              displayName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="user-details">
            <h4>{displayName}</h4>
            <p>{roleLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;


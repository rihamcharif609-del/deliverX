import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ userRole = 'sender' }) => {
  const menuItems = {
    admin: [
      { label: 'Dashboard', page: '/admin' },
      { label: 'All Deliveries', page: '/admin/deliveries' },
      { label: 'Courier Verification', page: '/admin/courier-verification' },
      { label: 'Manage Users', page: '/admin/users' },
    ],
    sender: [
      { label: 'Dashboard', page: '/sender' },
      { label: 'My Deliveries', page: '/sender/deliveries' },
      { label: 'Create Delivery', page: '/sender/create' },
      { label: 'Track Package', page: '/sender/tracking' },
    ],
    courier: [
      { label: 'Dashboard', page: '/courier' },
      { label: 'Available', page: '/courier/available' },
      { label: 'My Deliveries', page: '/courier/deliveries' },
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
        <h2>DeliverX</h2>
        <p>{t('deliveryManagement')}</p>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {items.map((item) => (
            <li
              key={item.page}
              className={location.pathname === item.page ? 'active' : ''}
              onClick={() => navigateToItem(item)}
            >
              {item.label === 'Dashboard' ? t('dashboard') :
               item.label === 'All Deliveries' ? t('allDeliveries') :
               item.label === 'My Deliveries' ? t('myDeliveries') :
               item.label === 'Courier Verification' ? 'Courier Verification' :
               item.label === 'Manage Users' ? t('manageUsers') :
               item.label === 'Create Delivery' ? t('createDelivery') :
               item.label === 'Track Package' ? t('trackPackage') :
               item.label === 'Available' ? t('available') : item.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer" onClick={navigateToProfile} style={{ cursor: 'pointer' }}>
        <div className="user-info">
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

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = ({ userRole = 'sender', activePage, onNavigate, onProfileClick }) => {
  const menuItems = {
    admin: [
      { label: 'Dashboard', page: '/admin' },
      { label: 'All Deliveries', page: '/admin/deliveries' },
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

  const items = menuItems[userRole] || menuItems.sender;

  const role = userRole || "sender";

  const navigate = useNavigate();

  const { t } = useLanguage();

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
              onClick={() => {
  if (item.page === '/sender/tracking') {
    
    const deliveries = JSON.parse(localStorage.getItem('myDeliveries')) || [];

    if (deliveries.length === 1) {
      navigate(`/sender/tracking/${deliveries[0].id}`);
    } else {
      navigate('/sender/tracking');
    }
  
  } else {
    navigate(item.page);
  }
}}

            >
              {item.label === 'Dashboard' ? t('dashboard') :
               item.label === 'All Deliveries' ? t('allDeliveries') :
               item.label === 'My Deliveries' ? t('myDeliveries') :
               item.label === 'Manage Users' ? t('manageUsers') :
               item.label === 'Create Delivery' ? t('createDelivery') :
               item.label === 'Track Package' ? t('trackPackage') :
               item.label === 'Available' ? t('available') : item.label}
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">

  <div className="sidebar-footer" onClick={() => {
    // Hna kanshoufou chnu l-role dyal l-user bach n-tsiftوه l-blasa s-s7i7a
    if (userRole === 'admin') {
      navigate('/admin/profile');
    } else if (userRole === 'sender') {
      navigate('/sender/profile');
    } else if (userRole === 'courier') {
      navigate('/courier/profile');
    }
  }} style={{ cursor: 'pointer' }}>
        <div className="user-info">
          <div className="user-avatar">
            {userRole === 'admin' ? 'A' : userRole === 'sender' ? 'S' : 'C'}
          </div>
          <div className="user-details">
            <h4>
              {userRole === 'admin' ? 'John Admin' : 
               userRole === 'sender' ? 'John Sender' : 'Mike Courier'}
            </h4>
            <p>{userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Sidebar;
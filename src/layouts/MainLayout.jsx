import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaLaptopCode, FaChevronUp, FaChevronDown } from 'react-icons/fa';

const MainLayout = ({ children, userRole, activePage, onNavigate, setUserRole, darkMode: _propDarkMode, setDarkMode: _propSetDarkMode, onProfileClick }) => {
  const { darkMode, setDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isOpenSwitcher, setIsOpenSwitcher] = useState(false);

  const handleRoleSwitch = (targetRole, path) => {
    if (setUserRole) {
      setUserRole(targetRole);
    }
    navigate(path);
  };

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar 
        userRole={userRole} 
        activePage={activePage} 
        onNavigate={onNavigate}
        onProfileClick={onProfileClick}
      />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)' }}>
        <Header onNavigate={onNavigate} userRole={userRole} darkMode={darkMode}
  setDarkMode={setDarkMode} />
        <main style={{ 
          padding: 'calc(var(--header-height) + 30px) 30px 30px 30px',
          minHeight: '100vh',
          backgroundColor: 'var(--background-color)'
        }}>
          {children}
        </main>
      </div>

      {/* Floating Interactive Demo Switcher */}
      <div className="demo-role-switcher" style={{ 
        width: isOpenSwitcher ? '280px' : '60px',
        height: isOpenSwitcher ? 'auto' : '60px',
        borderRadius: isOpenSwitcher ? '16px' : '50%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOpenSwitcher ? 'stretch' : 'center',
        justifyContent: isOpenSwitcher ? 'flex-start' : 'center',
        cursor: isOpenSwitcher ? 'default' : 'pointer',
        padding: isOpenSwitcher ? '16px' : '0'
      }} onClick={() => { if (!isOpenSwitcher) setIsOpenSwitcher(true); }}>
        
        {!isOpenSwitcher ? (
          <span style={{ fontSize: '24px', title: 'Open Demo Panel' }}>🛠️</span>
        ) : (
          <>
            <div className="switcher-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4>
                <FaLaptopCode style={{ color: '#2563eb' }} />
                <span>Demo Flows</span>
              </h4>
              <button 
                onClick={(e) => { e.stopPropagation(); setIsOpenSwitcher(false); }} 
                style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer' }}
              >
                <FaChevronDown />
              </button>
            </div>
            
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Switch roles to test the Morocco delivery payment and OTP release flow in real time!
            </p>

            <div className="switcher-buttons">
              <button 
                className={`role-btn ${userRole === 'sender' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('sender', '/sender')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="role-dot sender" />
                  Sender Dashboard
                </span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>John</span>
              </button>

              <button 
                className={`role-btn ${userRole === 'courier' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('courier', '/courier')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="role-dot courier" />
                  Courier Dashboard
                </span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>Mike</span>
              </button>

              <button 
                className={`role-btn ${userRole === 'admin' ? 'active' : ''}`}
                onClick={() => handleRoleSwitch('admin', '/admin')}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="role-dot admin" />
                  Admin Dashboard
                </span>
                <span style={{ fontSize: '10px', opacity: 0.7 }}>JD</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
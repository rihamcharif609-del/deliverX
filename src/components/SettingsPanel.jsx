import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FaTimes, FaGlobe, FaBell, FaMoon } from 'react-icons/fa';

const SettingsPanel = ({ isOpen, onClose, darkMode, setDarkMode }) => {
  const { language, setLanguage, t } = useLanguage();

  // Local state for notifications, initialized from localStorage, defaulting to true
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    return localStorage.getItem('settings_notifications') !== 'false';
  });

  const handleNotificationsChange = () => {
    const nextState = !notificationsEnabled;
    setNotificationsEnabled(nextState);
    localStorage.setItem('settings_notifications', nextState ? 'true' : 'false');
  };

  if (!isOpen) return null;

  // Determine language direction (RTL for Arabic, LTR for English/French)
  const isRtl = language === 'ar';

  return (
    <>
      {/* Settings Panel Overlay */}
      <div className="settings-overlay" onClick={onClose}></div>

      {/* Settings Panel Sidebar */}
      <div className={`settings-sidebar ${isRtl ? 'rtl' : ''}`}>
        <div className="settings-header">
          <h2>{t('settings')}</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close settings">
            <FaTimes />
          </button>
        </div>

        <div className="settings-content">
          {/* Dark Mode Option */}
          <div className="setting-item-minimal">
            <div className="setting-item-info">
              <FaMoon className="setting-icon" />
              <span>{t('darkMode')}</span>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                checked={darkMode} 
                onChange={() => setDarkMode(!darkMode)}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Notifications Option */}
          <div className="setting-item-minimal">
            <div className="setting-item-info">
              <FaBell className="setting-icon" />
              <span>{t('notifications')}</span>
            </div>
            <label className="switch-toggle">
              <input 
                type="checkbox" 
                checked={notificationsEnabled} 
                onChange={handleNotificationsChange}
              />
              <span className="switch-slider"></span>
            </label>
          </div>

          {/* Language Option */}
          <div className="setting-item-minimal language-select-item">
            <div className="setting-item-info">
              <FaGlobe className="setting-icon" />
              <span>{t('language')}</span>
            </div>
            <div className="select-wrapper">
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="minimal-select"
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية (Arabic)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
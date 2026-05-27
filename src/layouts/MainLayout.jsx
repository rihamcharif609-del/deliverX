import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const MainLayout = ({
  children,
  userRole,
  activePage,
  onNavigate,
  onProfileClick,
}) => {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <div style={{ display: 'flex' }}>
      <Sidebar
        userRole={userRole}
        activePage={activePage}
        onNavigate={onNavigate}
        onProfileClick={onProfileClick}
      />
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)' }}>
        <Header
          onNavigate={onNavigate}
          userRole={userRole}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
        <main
          style={{
            padding: 'calc(var(--header-height) + 30px) 30px 30px 30px',
            minHeight: '100vh',
            backgroundColor: 'var(--background-color)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;

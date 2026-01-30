import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import './Layout.css';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Overview',
      '/user-policies': 'User Policies',
      '/activity-log': 'Activity Log',
      '/system-configuration': 'System Configuration',
    };
    return titles[path] || 'MFA Logon';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
      <div className="main-wrapper">
        <Header title={getPageTitle()} onMenuToggle={toggleSidebar} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

import { NavLink, Link } from 'react-router-dom';
import { 
  Shield, 
  LayoutDashboard, 
  Users, 
  Activity,
  Settings,
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      section: 'Main Menu',
      items: [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/user-policies', label: 'User Policies', icon: Users },
        { path: '/activity-log', label: 'Activity Log', icon: Activity },
        { path: '/settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <>
      <div 
        className={`sidebar-overlay ${isOpen ? 'active' : ''}`} 
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={onClose}>
            <div className="sidebar-logo-icon">
              <Shield />
            </div>
            <span className="sidebar-logo-text">
              MFA <span>Logon</span>
            </span>
          </Link>
        </div>

        <nav className="sidebar-content">
          {navItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="nav-section">
              <h3 className="nav-section-title">{section.section}</h3>
              <ul className="nav-list">
                {section.items.map((item) => (
                  <li key={item.path} className="nav-item">
                    <NavLink
                      to={item.path}
                      className={({ isActive }) => 
                        `nav-link ${isActive ? 'active' : ''}`
                      }
                      onClick={onClose}
                    >
                      <item.icon className="nav-link-icon" />
                      <span className="nav-link-text">{item.label}</span>
                      {item.badge && (
                        <span className="nav-link-badge">{item.badge}</span>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;

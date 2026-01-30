import { useState, useRef, useEffect } from 'react';
import { Menu, LogOut } from 'lucide-react';
import './Header.css';

const Header = ({ title, onMenuToggle }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="header">
      <div className="header-left">
        <button 
          className="mobile-menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu />
        </button>
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        <div className="header-user" ref={dropdownRef}>
          <button 
            className="header-user-btn"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            aria-expanded={isDropdownOpen}
          >
            <div className="header-avatar">SR</div>
          </button>

          <div className={`user-dropdown ${isDropdownOpen ? 'open' : ''}`}>
            <div className="user-dropdown-header">
              <div className="user-dropdown-avatar">SR</div>
              <div className="user-dropdown-info">
                <div className="user-dropdown-name">Soumya Prasakam</div>
                <div className="user-dropdown-email">sr@datanub.in</div>
              </div>
            </div>
            <button className="user-dropdown-logout" onClick={() => setIsDropdownOpen(false)}>
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

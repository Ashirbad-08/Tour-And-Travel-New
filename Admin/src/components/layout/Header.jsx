import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiMail, FiUser, FiLogOut, FiChevronDown } from 'react-icons/fi';
import { MdFlight } from 'react-icons/md';
import api from '../../utils/api';
import './Header.css';

const Header = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const dropdownRef = useRef(null);

  // Load admin from localStorage
  useEffect(() => {
    const loadAdmin = () => {
      const cached = localStorage.getItem('adminUser');
      if (cached) {
        try { setAdmin(JSON.parse(cached)); } catch { /* ignore */ }
      }
    };
    loadAdmin();

    // Listen for profile updates
    window.addEventListener('adminProfileUpdated', loadAdmin);
    window.addEventListener('storage', loadAdmin);
    return () => {
      window.removeEventListener('adminProfileUpdated', loadAdmin);
      window.removeEventListener('storage', loadAdmin);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = () => {
    const f = (admin?.firstName || '')[0] || '';
    const l = (admin?.lastName || '')[0] || '';
    return (f + l).toUpperCase() || 'AD';
  };

  const getDisplayName = () => {
    if (admin?.firstName) return `${admin.firstName} ${admin.lastName || ''}`.trim();
    return 'Admin User';
  };

  const getRoleName = () => {
    if (admin?.role === 'main_admin') return 'Main Admin';
    if (admin?.role) return admin.role.charAt(0).toUpperCase() + admin.role.slice(1);
    return 'Administrator';
  };

  const handleLogout = async () => {
    try {
      await api.post('/admin/auth/logout');
    } catch { /* ignore logout API errors */ }
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="logo">
          <div className="logo-icon"><MdFlight size={20} /></div>
          <span>Pacific Travel</span>
        </div>
      </div>
      <div className="header-right">
        <div className="header-icon">
          <FiBell size={20} />
          <div className="notification-badge"></div>
        </div>
        <div className="header-icon">
          <FiMail size={20} />
        </div>

        {/* User Profile Dropdown */}
        <div className="user-dropdown-wrapper" ref={dropdownRef}>
          <div
            className={`user-profile ${dropdownOpen ? 'active' : ''}`}
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <div className="user-avatar">{getInitials()}</div>
            <div className="user-info">
              <div className="user-name">{getDisplayName()}</div>
              <div className="user-role">{getRoleName()}</div>
            </div>
            <FiChevronDown
              size={14}
              className={`user-chevron ${dropdownOpen ? 'rotated' : ''}`}
            />
          </div>

          {dropdownOpen && (
            <div className="user-dropdown">
              <div className="dropdown-profile-info">
                <div className="dropdown-avatar-large">{getInitials()}</div>
                <div className="dropdown-name">{getDisplayName()}</div>
                <div className="dropdown-email">{admin?.email || ''}</div>
              </div>
              <div className="dropdown-divider" />
              <button
                className="dropdown-item"
                onClick={() => { setDropdownOpen(false); navigate('/profile'); }}
              >
                <FiUser size={16} />
                My Profile
              </button>
              <div className="dropdown-divider" />
              <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                <FiLogOut size={16} />
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

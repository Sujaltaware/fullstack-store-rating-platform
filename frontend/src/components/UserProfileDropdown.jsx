import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const UserProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roleLabels = { admin: 'Administrator', user: 'Normal User', store_owner: 'Store Owner' };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const handleNav = (path) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="profile-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="profile-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="profile-avatar">{getInitials(user.name)}</span>
        <span className="profile-trigger-name">{user.name.split(' ')[0]}</span>
        <span className={`profile-chevron ${open ? 'open' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="profile-menu">
          <div className="profile-menu-header">
            <span className="profile-avatar profile-avatar-lg">{getInitials(user.name)}</span>
            <div className="profile-menu-info">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
              <span className="role-badge">{roleLabels[user.role] || user.role}</span>
            </div>
          </div>

          <div className="profile-menu-divider" />

          <button type="button" className="profile-menu-item" onClick={() => handleNav('/profile')}>
            <span className="menu-icon">👤</span>
            Update Profile
          </button>
          <button type="button" className="profile-menu-item" onClick={() => handleNav('/profile?tab=password')}>
            <span className="menu-icon">🔒</span>
            Change Password
          </button>

          <div className="profile-menu-divider" />

          <button type="button" className="profile-menu-item profile-menu-logout" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileDropdown;

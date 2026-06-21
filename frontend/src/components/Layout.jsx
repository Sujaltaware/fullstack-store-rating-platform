import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserProfileDropdown from './UserProfileDropdown';

const Layout = () => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavLinks = () => {
    if (user.role === 'admin') {
      return [
        { to: '/admin/dashboard', label: 'Dashboard' },
        { to: '/admin/users', label: 'Users' },
        { to: '/admin/stores', label: 'Stores' },
      ];
    }
    if (user.role === 'store_owner') {
      return [{ to: '/owner/dashboard', label: 'My Dashboard' }];
    }
    return [{ to: '/stores', label: 'Browse Stores' }];
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="app-layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <Link to="/">⭐ StoreRate</Link>
        </div>
        <div className="navbar-links">
          {getNavLinks().map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={isActive(link.to) ? 'active' : ''}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <div className="navbar-user">
          <UserProfileDropdown />
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

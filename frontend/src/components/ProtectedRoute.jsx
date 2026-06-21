import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirectMap = {
      admin: '/admin/dashboard',
      user: '/stores',
      store_owner: '/owner/dashboard',
    };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;

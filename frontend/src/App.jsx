import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers from './pages/admin/Users';
import AdminStores from './pages/admin/Stores';
import AddUser from './pages/admin/AddUser';
import AddStore from './pages/admin/AddStore';
import UserDetails from './pages/admin/UserDetails';
import StoreList from './pages/user/StoreList';
import OwnerDashboard from './pages/owner/Dashboard';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'store_owner') return '/owner/dashboard';
    return '/stores';
  };

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={getDefaultRoute()} /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultRoute()} /> : <Register />} />

      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/change-password" element={<Navigate to="/profile?tab=password" replace />} />

        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['admin']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/users/add" element={<ProtectedRoute roles={['admin']}><AddUser /></ProtectedRoute>} />
        <Route path="/admin/users/:id" element={<ProtectedRoute roles={['admin']}><UserDetails /></ProtectedRoute>} />
        <Route path="/admin/stores" element={<ProtectedRoute roles={['admin']}><AdminStores /></ProtectedRoute>} />
        <Route path="/admin/stores/add" element={<ProtectedRoute roles={['admin']}><AddStore /></ProtectedRoute>} />

        <Route path="/stores" element={<ProtectedRoute roles={['user']}><StoreList /></ProtectedRoute>} />
        <Route path="/owner/dashboard" element={<ProtectedRoute roles={['store_owner']}><OwnerDashboard /></ProtectedRoute>} />
      </Route>

      <Route path="*" element={<Navigate to={getDefaultRoute()} />} />
    </Routes>
  );
}

export default App;

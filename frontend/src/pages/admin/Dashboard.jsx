import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(({ data }) => setStats(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  const roleLabels = { admin: 'Admins', user: 'Users', store_owner: 'Store Owners' };
  const roleBadgeLabels = { admin: 'Admin', user: 'User', store_owner: 'Owner' };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-welcome">
        <div>
          <h1>Welcome back, {user.name.split(' ')[0]} 👋</h1>
          <p>Here's what's happening on your platform today.</p>
        </div>
        <div className="dashboard-quick-actions">
          <Link to="/admin/users/add" className="btn btn-primary">+ Add User</Link>
          <Link to="/admin/stores/add" className="btn btn-outline">+ Add Store</Link>
        </div>
      </div>

      <div className="stat-card-grid">
        <div className="stat-card stat-card-users">
          <div className="stat-card-icon">👥</div>
          <div className="stat-card-body">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
        </div>
        <div className="stat-card stat-card-stores">
          <div className="stat-card-icon">🏪</div>
          <div className="stat-card-body">
            <div className="stat-label">Total Stores</div>
            <div className="stat-value">{stats.totalStores}</div>
          </div>
        </div>
        <div className="stat-card stat-card-ratings">
          <div className="stat-card-icon">⭐</div>
          <div className="stat-card-body">
            <div className="stat-label">Total Ratings</div>
            <div className="stat-value">{stats.totalRatings}</div>
          </div>
        </div>
        <div className="stat-card stat-card-avg">
          <div className="stat-card-icon">📊</div>
          <div className="stat-card-body">
            <div className="stat-label">Avg. Rating</div>
            <div className="stat-value">{stats.averageRating}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Users by Role</h2>
            <Link to="/admin/users">View all →</Link>
          </div>
          <div className="role-breakdown">
            {Object.entries(stats.usersByRole).map(([role, count]) => (
              <div key={role} className="role-breakdown-item">
                <span className="role-breakdown-label">{roleLabels[role]}</span>
                <div className="role-breakdown-bar-wrap">
                  <div
                    className={`role-breakdown-bar role-bar-${role}`}
                    style={{ width: stats.totalUsers ? `${(count / stats.totalUsers) * 100}%` : '0%' }}
                  />
                </div>
                <span className="role-breakdown-count">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Recent Users</h2>
            <Link to="/admin/users">View all →</Link>
          </div>
          <ul className="recent-list">
            {stats.recentUsers.length === 0 ? (
              <li className="recent-empty">No users yet</li>
            ) : (
              stats.recentUsers.map((u) => (
                <li key={u.id} className="recent-item">
                  <div className="recent-item-avatar">{u.name.slice(0, 2).toUpperCase()}</div>
                  <div className="recent-item-info">
                    <strong>{u.name}</strong>
                    <span>{u.email}</span>
                  </div>
                  <span className="role-badge role-badge-sm">{roleBadgeLabels[u.role] || u.role}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="card dashboard-full-width">
          <div className="card-header">
            <h2>Recent Stores</h2>
            <Link to="/admin/stores">View all →</Link>
          </div>
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Store Name</th>
                  <th>Address</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentStores.length === 0 ? (
                  <tr><td colSpan={3} className="empty-row">No stores yet</td></tr>
                ) : (
                  stats.recentStores.map((store) => (
                    <tr key={store.id}>
                      <td><strong>{store.name}</strong></td>
                      <td>{store.address}</td>
                      <td>⭐ {store.rating}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

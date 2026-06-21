import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/admin/users/${id}`)
      .then(({ data }) => setUser(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <div className="alert alert-error">User not found</div>;

  const roleLabels = { admin: 'Admin', user: 'Normal User', store_owner: 'Store Owner' };

  return (
    <div>
      <div className="page-header">
        <h1>User Details</h1>
        <Link to="/admin/users" className="btn btn-outline">← Back to Users</Link>
      </div>

      <div className="card" style={{ maxWidth: '600px' }}>
        <dl className="detail-grid">
          <dt>Name</dt>
          <dd>{user.name}</dd>
          <dt>Email</dt>
          <dd>{user.email}</dd>
          <dt>Address</dt>
          <dd>{user.address}</dd>
          <dt>Role</dt>
          <dd>{roleLabels[user.role] || user.role}</dd>
          {user.role === 'store_owner' && user.rating !== null && (
            <>
              <dt>Store Rating</dt>
              <dd>⭐ {user.rating} / 5.0</dd>
            </>
          )}
        </dl>
      </div>
    </div>
  );
};

export default UserDetails;

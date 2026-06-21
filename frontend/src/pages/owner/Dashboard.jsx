import { useState, useEffect } from 'react';
import api from '../../api/axios';
import SortableTable from '../../components/SortableTable';

const OwnerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/stores/owner/dashboard')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  if (!data?.store) {
    return (
      <div>
        <div className="page-header"><h1>Store Owner Dashboard</h1></div>
        <div className="card">
          <p style={{ color: '#64748b' }}>No store has been assigned to your account yet. Please contact the administrator.</p>
        </div>
      </div>
    );
  }

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Address' },
    { key: 'rating', label: 'Rating', render: (row) => `⭐ ${row.rating}` },
    {
      key: 'updated_at',
      label: 'Date',
      render: (row) => new Date(row.updated_at).toLocaleDateString(),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>{data.store.name}</h1>
      </div>

      <div className="card-grid">
        <div className="stat-card">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">⭐ {data.averageRating}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Ratings</div>
          <div className="stat-value">{data.totalRatings}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Users Who Rated Your Store</h2>
      <SortableTable columns={columns} data={data.raters} />
    </div>
  );
};

export default OwnerDashboard;

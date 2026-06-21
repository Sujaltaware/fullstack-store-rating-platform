import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import StarRating from '../../components/StarRating';

const StoreList = () => {
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ name: '', address: '' });
  const [sortBy, setSortBy] = useState('s.name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [ratingInputs, setRatingInputs] = useState({});
  const [messages, setMessages] = useState({});

  const fetchStores = useCallback(() => {
    setLoading(true);
    const params = { ...filters, sortBy, sortOrder };
    api.get('/stores', { params })
      .then(({ data }) => {
        setStores(data);
        const inputs = {};
        data.forEach((s) => { inputs[s.id] = s.userRating || 0; });
        setRatingInputs(inputs);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [filters, sortBy, sortOrder]);

  useEffect(() => {
    const timer = setTimeout(fetchStores, 300);
    return () => clearTimeout(timer);
  }, [fetchStores]);

  const handleSubmitRating = async (storeId) => {
    const rating = ratingInputs[storeId];
    if (!rating || rating < 1 || rating > 5) return;

    const store = stores.find((s) => s.id === storeId);
    const isUpdate = store?.userRating !== null;

    try {
      if (isUpdate) {
        await api.put(`/ratings/${storeId}`, { rating });
      } else {
        await api.post('/ratings', { storeId, rating });
      }
      setMessages({ ...messages, [storeId]: isUpdate ? 'Rating updated!' : 'Rating submitted!' });
      fetchStores();
      setTimeout(() => setMessages((m) => ({ ...m, [storeId]: '' })), 3000);
    } catch (err) {
      setMessages({ ...messages, [storeId]: err.response?.data?.message || 'Failed to submit rating' });
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Browse Stores</h1>
      </div>

      <div className="filter-bar">
        <div className="filter-item">
          <label>Store Name</label>
          <input
            placeholder="Search by name..."
            value={filters.name}
            onChange={(e) => setFilters({ ...filters, name: e.target.value })}
          />
        </div>
        <div className="filter-item">
          <label>Address</label>
          <input
            placeholder="Search by address..."
            value={filters.address}
            onChange={(e) => setFilters({ ...filters, address: e.target.value })}
          />
        </div>
        <div className="filter-item">
          <label>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="s.name">Name</option>
            <option value="s.address">Address</option>
            <option value="overall_rating">Rating</option>
          </select>
        </div>
        <div className="filter-item">
          <label>Order</label>
          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : stores.length === 0 ? (
        <div className="card"><p style={{ textAlign: 'center', color: '#64748b' }}>No stores found</p></div>
      ) : (
        <div className="store-grid">
          {stores.map((store) => (
            <div key={store.id} className="store-card">
              <h3>{store.name}</h3>
              <p className="address">📍 {store.address}</p>
              <div className="rating-info">
                <span>Overall: <strong>⭐ {store.overallRating}</strong></span>
                <span>({store.totalRatings} ratings)</span>
              </div>
              {store.userRating && (
                <div className="rating-info">
                  <span>Your rating: <strong>⭐ {store.userRating}</strong></span>
                </div>
              )}
              <div className="rating-section">
                <label>{store.userRating ? 'Update your rating:' : 'Rate this store:'}</label>
                <StarRating
                  value={ratingInputs[store.id] || 0}
                  onChange={(val) => setRatingInputs({ ...ratingInputs, [store.id]: val })}
                />
                <button
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => handleSubmitRating(store.id)}
                  disabled={!ratingInputs[store.id]}
                >
                  {store.userRating ? 'Update Rating' : 'Submit Rating'}
                </button>
                {messages[store.id] && (
                  <p style={{ fontSize: '0.8rem', marginTop: '0.5rem', color: messages[store.id].includes('!') && !messages[store.id].includes('Failed') ? '#10b981' : '#ef4444' }}>
                    {messages[store.id]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StoreList;

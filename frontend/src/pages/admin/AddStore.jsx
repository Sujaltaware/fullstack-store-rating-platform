import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const AddStore = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', ownerId: '' });
  const [owners, setOwners] = useState([]);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/admin/store-owners').then(({ data }) => setOwners(data)).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.name) newErrors.name = 'Store name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.address) newErrors.address = 'Address is required';
    if (!form.ownerId) newErrors.ownerId = 'Please select a store owner';
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);
    setMessage('');

    try {
      await api.post('/admin/stores', { ...form, ownerId: parseInt(form.ownerId) });
      navigate('/admin/stores');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add New Store</h1>
        <Link to="/admin/stores" className="btn btn-outline">← Back</Link>
      </div>

      <div className="card" style={{ maxWidth: '520px' }}>
        {message && <div className="alert alert-error">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Store Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label>Store Owner</label>
            <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
              <option value="">Select owner...</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
              ))}
            </select>
            {errors.ownerId && <span className="error">{errors.ownerId}</span>}
            {owners.length === 0 && (
              <span className="hint">No store owners found. Create a user with Store Owner role first.</span>
            )}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Store'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStore;

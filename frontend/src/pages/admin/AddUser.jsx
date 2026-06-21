import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const AddUser = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '', role: 'user' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (form.name.length < 20 || form.name.length > 60) newErrors.name = 'Name must be 20-60 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.address) newErrors.address = 'Address is required';
    if (form.password.length < 8 || form.password.length > 16) {
      newErrors.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(form.password) || !/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      newErrors.password = 'Must have uppercase and special character';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setMessage('');

    try {
      await api.post('/admin/users', form);
      navigate('/admin/users');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.path] = e.msg; });
        setErrors(fieldErrors);
      } else {
        setMessage(err.response?.data?.message || 'Failed to create user');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Add New User</h1>
        <Link to="/admin/users" className="btn btn-outline">← Back</Link>
      </div>

      <div className="card" style={{ maxWidth: '520px' }}>
        {message && <div className="alert alert-error">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <span className="hint">20-60 characters</span>
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
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="user">Normal User</option>
              <option value="admin">Admin</option>
              <option value="store_owner">Store Owner</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;

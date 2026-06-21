import { useState } from 'react';
import api from '../api/axios';

const ChangePassword = () => {
  const [form, setForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!form.currentPassword) newErrors.currentPassword = 'Current password is required';
    if (form.password.length < 8 || form.password.length > 16) {
      newErrors.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Must contain an uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      newErrors.password = 'Must contain a special character';
    }
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setMessage('');
    setLoading(true);

    try {
      await api.put('/auth/change-password', {
        currentPassword: form.currentPassword,
        password: form.password,
      });
      setMessage('Password updated successfully!');
      setForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Change Password</h1>
      </div>

      <div className="card" style={{ maxWidth: '480px' }}>
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
            {errors.currentPassword && <span className="error">{errors.currentPassword}</span>}
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;

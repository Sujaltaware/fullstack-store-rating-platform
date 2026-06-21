import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (form.name.length < 20 || form.name.length > 60) {
      newErrors.name = 'Name must be between 20 and 60 characters';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (form.address.length > 400) {
      newErrors.address = 'Address must not exceed 400 characters';
    }
    if (form.password.length < 8 || form.password.length > 16) {
      newErrors.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(form.password)) {
      newErrors.password = 'Password must contain an uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(form.password)) {
      newErrors.password = 'Password must contain a special character';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setServerError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/stores');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => {
          fieldErrors[e.path] = e.msg;
        });
        setErrors(fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Create Account</h1>
        <p className="subtitle">Join the Store Rating Platform</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input id="name" name="name" value={form.name} onChange={handleChange} required />
            <span className="hint">20-60 characters</span>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input id="address" name="address" value={form.address} onChange={handleChange} required />
            <span className="hint">Max 400 characters</span>
            {errors.address && <span className="error">{errors.address}</span>}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={handleChange} required />
            <span className="hint">8-16 chars, 1 uppercase, 1 special character</span>
            {errors.password && <span className="error">{errors.password}</span>}
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;

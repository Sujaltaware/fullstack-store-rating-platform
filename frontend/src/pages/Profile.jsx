import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'password' ? 'password' : 'profile');

  const [profileForm, setProfileForm] = useState({ name: '', address: '' });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', password: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', address: user.address || '' });
    }
  }, [user]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'password') setActiveTab('password');
  }, [searchParams]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'password' ? { tab: 'password' } : {});
  };

  const validateProfile = () => {
    const errors = {};
    if (profileForm.name.length < 20 || profileForm.name.length > 60) {
      errors.name = 'Name must be between 20 and 60 characters';
    }
    if (!profileForm.address) errors.address = 'Address is required';
    if (profileForm.address.length > 400) errors.address = 'Address must not exceed 400 characters';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (passwordForm.password.length < 8 || passwordForm.password.length > 16) {
      errors.password = 'Password must be 8-16 characters';
    } else if (!/[A-Z]/.test(passwordForm.password)) {
      errors.password = 'Must contain an uppercase letter';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.password)) {
      errors.password = 'Must contain a special character';
    }
    if (passwordForm.password !== passwordForm.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;

    setProfileLoading(true);
    setProfileMessage('');

    try {
      const { data } = await api.put('/auth/profile', profileForm);
      updateUser(data.user, data.token);
      setProfileMessage('Profile updated successfully!');
    } catch (err) {
      const apiErrors = err.response?.data?.errors;
      if (apiErrors) {
        const fieldErrors = {};
        apiErrors.forEach((e) => { fieldErrors[e.path] = e.msg; });
        setProfileErrors(fieldErrors);
      } else {
        setProfileMessage(err.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    setPasswordLoading(true);
    setPasswordMessage('');

    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        password: passwordForm.password,
      });
      setPasswordMessage('Password updated successfully!');
      setPasswordForm({ currentPassword: '', password: '', confirmPassword: '' });
    } catch (err) {
      setPasswordMessage(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const roleLabels = { admin: 'Administrator', user: 'Normal User', store_owner: 'Store Owner' };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="profile-layout">
        <div className="profile-sidebar card">
          <div className="profile-sidebar-user">
            <div className="profile-avatar profile-avatar-xl">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="role-badge">{roleLabels[user.role]}</span>
          </div>
          <div className="profile-tabs">
            <button
              type="button"
              className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => switchTab('profile')}
            >
              Edit Profile
            </button>
            <button
              type="button"
              className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => switchTab('password')}
            >
              Change Password
            </button>
          </div>
        </div>

        <div className="profile-content card">
          {activeTab === 'profile' ? (
            <>
              <h2>Update Profile</h2>
              <p className="profile-desc">Update your name and address information.</p>

              {profileMessage && (
                <div className={`alert ${profileMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleProfileSubmit}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  />
                  <span className="hint">20-60 characters</span>
                  {profileErrors.name && <span className="error">{profileErrors.name}</span>}
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input value={user.email} disabled className="input-disabled" />
                  <span className="hint">Email cannot be changed</span>
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    rows={3}
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  />
                  <span className="hint">Max 400 characters</span>
                  {profileErrors.address && <span className="error">{profileErrors.address}</span>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                  {profileLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2>Change Password</h2>
              <p className="profile-desc">Keep your account secure with a strong password.</p>

              {passwordMessage && (
                <div className={`alert ${passwordMessage.includes('success') ? 'alert-success' : 'alert-error'}`}>
                  {passwordMessage}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit}>
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                  {passwordErrors.currentPassword && <span className="error">{passwordErrors.currentPassword}</span>}
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordForm.password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  />
                  <span className="hint">8-16 chars, 1 uppercase, 1 special character</span>
                  {passwordErrors.password && <span className="error">{passwordErrors.password}</span>}
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                  {passwordErrors.confirmPassword && <span className="error">{passwordErrors.confirmPassword}</span>}
                </div>
                <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;

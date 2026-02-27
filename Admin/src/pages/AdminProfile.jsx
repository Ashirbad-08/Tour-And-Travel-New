import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiEdit2, FiSave, FiX, FiShield, FiCheck, FiAlertCircle } from 'react-icons/fi';
import api from '../utils/api';
import '../styles/AdminProfile.css';

const AdminProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [showPwSection, setShowPwSection] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/auth/profile');
      const data = res.data;
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (err) {
      // Try localStorage fallback
      const cached = localStorage.getItem('adminUser');
      if (cached) {
        const data = JSON.parse(cached);
        setProfile(data);
        setForm({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
        });
      } else {
        showToast('Failed to load profile', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const getInitials = () => {
    const f = (profile?.firstName || form.firstName || '')[0] || '';
    const l = (profile?.lastName || form.lastName || '')[0] || '';
    return (f + l).toUpperCase() || 'AD';
  };

  const handleEdit = () => setEditing(true);

  const handleCancel = () => {
    setEditing(false);
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      email: profile?.email || '',
      phone: profile?.phone || '',
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      showToast('First and last name are required', 'error');
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch('/admin/auth/profile', form);
      if (res.data.admin) {
        setProfile(res.data.admin);
        localStorage.setItem('adminUser', JSON.stringify(res.data.admin));
        // Dispatch event so Header can update
        window.dispatchEvent(new Event('adminProfileUpdated'));
      }
      showToast(res.data.message || 'Profile updated!');
      setEditing(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      showToast('All password fields are required', 'error');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    setChangingPw(true);
    try {
      const res = await api.patch('/admin/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      showToast(res.data.message || 'Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPwSection(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setChangingPw(false);
    }
  };

  if (loading) {
    return (
      <div className="ap-loading">
        <div className="ap-spinner" />
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="ap-container">
      <div className="ap-header">
        <h1>My Profile</h1>
        <p>Manage your account information and security settings</p>
      </div>

      <div className="ap-grid">
        {/* Profile Card */}
        <div className="ap-card ap-profile-card">
          <div className="ap-avatar-section">
            <div className="ap-avatar-large">{getInitials()}</div>
            <h2>{profile?.firstName} {profile?.lastName}</h2>
            <span className="ap-role-badge">
              <FiShield size={13} />
              {profile?.role || 'Administrator'}
            </span>
            <p className="ap-email-display">{profile?.email}</p>
          </div>

          <div className="ap-quick-stats">
            <div className="ap-stat-item">
              <span className="ap-stat-icon"><FiUser /></span>
              <div>
                <span className="ap-stat-label">Account type</span>
                <span className="ap-stat-value">{profile?.role === 'main_admin' ? 'Main Admin' : 'Admin'}</span>
              </div>
            </div>
            <div className="ap-stat-item">
              <span className="ap-stat-icon"><FiShield /></span>
              <div>
                <span className="ap-stat-label">Status</span>
                <span className="ap-stat-value ap-active">Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details Form */}
        <div className="ap-card ap-details-card">
          <div className="ap-card-header">
            <div>
              <h3>Personal Information</h3>
              <p>Update your personal details here</p>
            </div>
            {!editing ? (
              <button className="ap-btn ap-btn-outline" onClick={handleEdit}>
                <FiEdit2 size={15} /> Edit
              </button>
            ) : (
              <button className="ap-btn ap-btn-ghost" onClick={handleCancel}>
                <FiX size={15} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSave}>
            <div className="ap-form-grid">
              <div className="ap-field">
                <label><FiUser size={14} /> First Name</label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({ ...form, firstName: e.target.value })}
                  disabled={!editing}
                  placeholder="First name"
                />
              </div>
              <div className="ap-field">
                <label><FiUser size={14} /> Last Name</label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({ ...form, lastName: e.target.value })}
                  disabled={!editing}
                  placeholder="Last name"
                />
              </div>
              <div className="ap-field">
                <label><FiMail size={14} /> Email Address</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  disabled={!editing}
                  placeholder="email@example.com"
                />
              </div>
              <div className="ap-field">
                <label><FiPhone size={14} /> Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  disabled={!editing}
                  placeholder="Phone number"
                />
              </div>
            </div>

            {editing && (
              <div className="ap-form-actions">
                <button type="submit" className="ap-btn ap-btn-primary" disabled={saving}>
                  {saving ? <span className="ap-btn-spinner" /> : <FiSave size={15} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Password Section */}
        <div className="ap-card ap-security-card">
          <div className="ap-card-header">
            <div>
              <h3>Security</h3>
              <p>Manage your password and security settings</p>
            </div>
            <button
              className={`ap-btn ${showPwSection ? 'ap-btn-ghost' : 'ap-btn-outline'}`}
              onClick={() => { setShowPwSection(!showPwSection); setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
            >
              {showPwSection ? <><FiX size={15} /> Cancel</> : <><FiLock size={15} /> Change Password</>}
            </button>
          </div>

          {showPwSection && (
            <form onSubmit={handlePasswordChange} className="ap-pw-form">
              <div className="ap-field">
                <label><FiLock size={14} /> Current Password</label>
                <input
                  type="password"
                  value={pwForm.currentPassword}
                  onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  placeholder="Enter current password"
                  autoComplete="current-password"
                />
              </div>
              <div className="ap-form-grid">
                <div className="ap-field">
                  <label><FiLock size={14} /> New Password</label>
                  <input
                    type="password"
                    value={pwForm.newPassword}
                    onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="ap-field">
                  <label><FiLock size={14} /> Confirm New Password</label>
                  <input
                    type="password"
                    value={pwForm.confirmPassword}
                    onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div className="ap-form-actions">
                <button type="submit" className="ap-btn ap-btn-primary" disabled={changingPw}>
                  {changingPw ? <span className="ap-btn-spinner" /> : <FiCheck size={15} />}
                  {changingPw ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`ap-toast ${toast.type}`}>
          {toast.type === 'success' ? <FiCheck size={16} /> : <FiAlertCircle size={16} />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminProfile;

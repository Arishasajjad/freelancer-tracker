import { useEffect, useState } from 'react';

const API_URL = 'https://freelancer-tracker-pn21.onrender.com/api';
const emptyForm = {
  name: '',
  email: '',
  phone: '',
  businessName: '',
  currency: 'PKR'
};

function Settings() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(
          `${API_URL}/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const data = await response.json();

        if (response.ok) {
          setForm({
            name: data.user.name || '',
            email: data.user.email || '',
            phone: data.user.phone || '',
            businessName:
              data.user.businessName || '',
            currency: data.user.currency || 'PKR'
          });
        } else {
          setMessage(
            data.message || 'Failed to load profile.'
          );
        }
      } catch (error) {
        setMessage('Could not connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      setMessage('Name and email are required.');
      return;
    }

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch(
        `${API_URL}/auth/profile`,
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },

          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (response.ok) {
        setForm({
          name: data.user.name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          businessName:
            data.user.businessName || '',
          currency: data.user.currency || 'PKR'
        });

        setMessage('Profile saved successfully!');
      } else {
        setMessage(
          data.message || 'Failed to save profile.'
        );
      }
    } catch (error) {
      setMessage('Could not connect to the server.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="page-placeholder">
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <div>
          <p className="settings-eyebrow">
            Account preferences
          </p>

          <h1>Settings</h1>

          <p className="settings-subtitle">
            Manage your profile and business details.
          </p>
        </div>
      </div>

      <div className="panel settings-panel">
        <div className="settings-panel-header">
          <div className="settings-avatar">
            {form.name
              ? form.name.charAt(0).toUpperCase()
              : 'F'}
          </div>

          <div>
            <h2>Profile Settings</h2>

            <p>
              These details are only visible in your
              Freelancer Tracker account.
            </p>
          </div>
        </div>

        <form
          className="settings-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Full Name</label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>

            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>

            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+92 300 1234567"
            />
          </div>

          <div className="form-group">
            <label>Business Name</label>

            <input
              type="text"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Your freelance business"
            />
          </div>

          <div className="form-group">
            <label>Default Currency</label>

            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
            >
              <option value="PKR">
                PKR — Pakistani Rupee
              </option>

              <option value="USD">
                USD — US Dollar
              </option>

              <option value="EUR">
                EUR — Euro
              </option>

              <option value="GBP">
                GBP — British Pound
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Account Email</label>

            <input
              type="text"
              value={form.email}
              disabled
            />
          </div>

          {message && (
            <p
              className={
                message.includes('successfully')
                  ? 'settings-success'
                  : 'settings-error'
              }
            >
              {message}
            </p>
          )}

          <div className="settings-form-actions">
            <button
              type="submit"
              className="primary-button"
              disabled={saving}
            >
              {saving
                ? 'Saving...'
                : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;
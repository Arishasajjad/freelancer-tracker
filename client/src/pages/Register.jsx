import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        'https://freelancer-tracker-pn21.onrender.com',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || 'Registration failed'
        );
        return;
      }

      alert('Account created successfully!');

      navigate('/login');

    } catch (error) {
      setError(
        'Cannot connect to server. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          F
        </div>

        <h1>Create account</h1>

        <p className="login-subtitle">
          Create your Freelancer Tracker account
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <label>Name</label>

          <input
            type="text"
            name="name"
            placeholder="Enter your name"
            value={form.name}
            onChange={handleChange}
            required
          />

          <label>Email</label>

          <input
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <label>Password</label>

          <input
            type="password"
            name="password"
            placeholder="Create a password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? 'Creating account...'
              : 'Create Account'}
          </button>

        </form>

        <p className="login-register-text">
          Already have an account?{' '}
          <button
            type="button"
            className="login-register-link"
            onClick={() => navigate('/login')}
          >
            Sign in
          </button>
        </p>

      </div>

    </div>
  );
}

export default Register;
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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
        'http://localhost:5000/api/auth/login',
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
        setError(data.message || 'Login failed');
        return;
      }

      // Save JWT token
      localStorage.setItem('token', data.token);

      // Save basic user information
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );

      // Go to dashboard
      navigate('/');

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

        <h1>Welcome back</h1>

        <p className="login-subtitle">
          Sign in to your Freelancer Tracker
        </p>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

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
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

        </form>

        {/* REGISTER LINK */}
        <p className="login-register-text">
          Don't have an account?{' '}
          <button
            type="button"
            className="login-register-link"
            onClick={() => navigate('/register')}
          >
            Create account
          </button>
        </p>

      </div>

    </div>
  );
}

export default Login;
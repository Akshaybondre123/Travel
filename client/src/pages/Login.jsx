import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="auth-sidebar">
        <Link to="/" className="logo" style={{ fontSize: '1.8rem' }}>
          <span className="logo-icon">✈️</span> Trip<span>Forge</span>
        </Link>
        <div className="auth-sidebar-hero">
          <h2>Craft your next adventure in seconds.</h2>
          <p>
            Upload your travel tickets or vouchers and let our AI transform raw booking data into a beautiful, personalized daily itinerary.
          </p>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} TripForge. All rights reserved.
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to manage your AI-powered travel itineraries.</p>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '0.5rem' }} 
              disabled={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ marginTop: '1.75rem', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            New to TripForge? <Link to="/register" style={{ fontWeight: 600 }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

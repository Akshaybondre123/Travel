import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [strengthColor, setStrengthColor] = useState('var(--danger)');
  const [strengthText, setStrengthText] = useState('Too short');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      return;
    }
    let score = 0;
    if (password.length >= 6) score += 30;
    if (password.length >= 10) score += 20;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    setStrength(score);

    if (score < 40) {
      setStrengthColor('var(--danger)');
      setStrengthText('Weak');
    } else if (score < 75) {
      setStrengthColor('var(--warning)');
      setStrengthText('Good');
    } else {
      setStrengthColor('var(--success)');
      setStrengthText('Very Strong');
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
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
          <h2>Your personal AI travel assistant.</h2>
          <p>
            No more copy-pasting details between emails and search maps. TripForge reads your files, maps your destinations, and charts a perfect timeline automatically.
          </p>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>
          &copy; {new Date().getFullYear()} TripForge. All rights reserved.
        </div>
      </div>

      <div className="auth-content">
        <div className="auth-card">
          <h1>Get started</h1>
          <p className="subtitle">Upload bookings and let AI craft your perfect trip plan.</p>
          {error && <p className="error-msg">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full name</label>
              <input 
                id="name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
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
            <div className="form-group" style={{ marginBottom: '1.75rem' }}>
              <label htmlFor="password">Password (min 6 characters)</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={6}
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
              {password && (
                <div>
                  <div className="password-strength">
                    <div 
                      className="password-strength-bar" 
                      style={{ width: `${strength}%`, backgroundColor: strengthColor }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strengthColor, fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                    Strength: {strengthText}
                  </span>
                </div>
              )}
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%' }} 
              disabled={loading}
            >
              {loading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>
          <p style={{ marginTop: '1.75rem', color: 'var(--muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            Already have an account? <Link to="/login" style={{ fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

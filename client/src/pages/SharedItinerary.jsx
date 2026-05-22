import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import ItineraryView from '../components/ItineraryView';

export default function SharedItinerary() {
  const { shareId } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get(`/itineraries/share/${shareId}`)
      .then((res) => setItinerary(res.data))
      .catch(() => setError('This shared itinerary is unavailable or private.'));
  }, [shareId]);

  if (error) {
    return (
      <div className="auth-page animate-fade-in">
        <div className="auth-content">
          <div className="auth-card" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '3rem' }}>🕵️‍♂️</span>
            <h1 style={{ marginTop: '1rem' }}>Trip Not Found</h1>
            <p className="subtitle" style={{ marginTop: '0.5rem', marginBottom: '1.5rem' }}>{error}</p>
            <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
              Go to Login Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <div className="loading-text">Fetching shared trip plan...</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Visual top bar for brand presence */}
      <div className="navbar-wrapper">
        <nav className="navbar container">
          <div className="logo" style={{ cursor: 'default' }}>
            <span className="logo-icon">✈️</span> Trip<span>Forge</span>
          </div>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
            Create Your Own Trip
          </Link>
        </nav>
      </div>

      <div className="container shared-page animate-fade-in">
        <div className="shared-badge">
          <span>👋</span> Shared by {itinerary.user?.name || 'a fellow traveler'}
        </div>

        <header className="page-header shared-header">
          <h1>{itinerary.title}</h1>
          <p>
            📍 {itinerary.destination} · Day-by-day travel schedule
          </p>
        </header>

        <div className="grid-2 shared-layout">
          <div className="card">
            <ItineraryView itinerary={itinerary} />
          </div>

          <div className="card">
            <h2 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Planning a trip?</h2>
            <p style={{ color: 'var(--muted)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Create your own automated daily plans. Upload tickets, hotel receipts, and bookings to generate unified visual itineraries in seconds.
            </p>
            <Link to="/register" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
              Sign Up for TripForge
            </Link>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        <p>Powered by <strong>TripForge AI</strong>. Plan and organize trips in seconds.</p>
      </footer>
    </div>
  );
}

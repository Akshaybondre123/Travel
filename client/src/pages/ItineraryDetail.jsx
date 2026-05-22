import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import ItineraryView from '../components/ItineraryView';

export default function ItineraryDetail() {
  const { id } = useParams();
  const [itinerary, setItinerary] = useState(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/itineraries/${id}`)
      .then((res) => {
        setItinerary(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const shareUrl = itinerary ? `${window.location.origin}/share/${itinerary.shareId}` : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">Loading your trip…</div>
      </div>
    );
  }

  if (!itinerary) {
    return (
      <div className="loading-screen">
        <h2>Itinerary not found</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const dayCount = itinerary.days?.length || 0;

  return (
    <div className="app-shell itinerary-page">
      <Navbar />

      <header className="page-cover-banner animate-fade-in">
        <div className="container">
          <Link to="/" className="cover-back">
            ← Back to Dashboard
          </Link>

          <div className="cover-label">✈️ AI Crafted Plan</div>
          <h1>{itinerary.title}</h1>

          <p className="cover-meta">
            {itinerary.destination && <span>📍 {itinerary.destination}</span>}
            {itinerary.startDate && (
              <>
                <span className="cover-meta-dot">·</span>
                <span>
                  📅{' '}
                  {new Date(itinerary.startDate).toLocaleDateString('en-IN')}
                  {itinerary.endDate &&
                    ` – ${new Date(itinerary.endDate).toLocaleDateString('en-IN')}`}
                </span>
              </>
            )}
            {dayCount > 0 && (
              <>
                <span className="cover-meta-dot">·</span>
                <span>
                  🗓️ {dayCount} day{dayCount !== 1 ? 's' : ''}
                </span>
              </>
            )}
          </p>

          <div className="cover-actions">
            <button type="button" className="btn btn-light" onClick={copyLink}>
              {copied ? '✓ Link Copied!' : '🔗 Share Link'}
            </button>
            <button type="button" className="btn btn-light" onClick={() => window.print()}>
              🖨️ Print
            </button>
          </div>
        </div>
      </header>

      <div className="container itinerary-body animate-fade-in">
        {itinerary.summary && (
          <p className="itinerary-summary-inline">{itinerary.summary}</p>
        )}

        <div className="itinerary-layout">
          <main className="card itinerary-main-card">
            <div className="itinerary-main-head">
              <h2>Day-by-day schedule</h2>
              <p>Your complete travel timeline</p>
            </div>
            <ItineraryView itinerary={itinerary} showSummary={false} />
          </main>

          <aside className="itinerary-sidebar">
            <div className="card sidebar-card">
              <h3>Share this trip</h3>
              <p>Anyone with this link can view your itinerary.</p>
              <div className="share-bar">
                <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
                <button
                  type="button"
                  className={`btn ${copied ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={copyLink}
                >
                  {copied ? 'Copied ✓' : 'Copy link'}
                </button>
              </div>
            </div>

            <div className="card sidebar-card">
              <h3>Trip overview</h3>
              <ul className="overview-list">
                <li>
                  <span>Destination</span>
                  <strong>{itinerary.destination || '—'}</strong>
                </li>
                <li>
                  <span>Duration</span>
                  <strong>{dayCount ? `${dayCount} days` : '—'}</strong>
                </li>
                <li>
                  <span>Activities</span>
                  <strong>
                    {(itinerary.days || []).reduce((n, d) => n + (d.activities?.length || 0), 0)}{' '}
                    planned
                  </strong>
                </li>
              </ul>
            </div>

            <Link to="/" className="btn btn-secondary" style={{ width: '100%', textAlign: 'center' }}>
              ← Back to dashboard
            </Link>
          </aside>
        </div>
      </div>

      <footer className="app-footer">
        <p>
          Powered by <strong>TripForge</strong> · {itinerary.destination || 'Your next adventure'}
        </p>
      </footer>
    </div>
  );
}

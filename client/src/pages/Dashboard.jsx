import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

const DOC_ICONS = {
  flight: '✈️',
  hotel: '🏨',
  train: '🚆',
  bus: '🚌',
  other: '📄',
};

function statusLabel(status) {
  if (status === 'extracted') return 'Ready';
  if (status === 'processing') return 'Analyzing';
  if (status === 'failed') return 'Failed';
  return 'Uploaded';
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [bRes, iRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/itineraries'),
      ]);
      setBookings(bRes.data || []);
      setItineraries(iRes.data || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, [load]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRetry = async (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.post(`/bookings/${id}/retry`);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Retry failed');
    }
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);
    try {
      const { data } = await api.post('/itineraries/generate', { bookingIds: selected });
      setSelected([]);
      await load();
      window.location.href = `/itinerary/${data._id}`;
    } catch (err) {
      setError(err.response?.data?.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const extracted = bookings.filter((b) => b.status === 'extracted');
  const canGenerate =
    selected.length > 0 &&
    selected.every((id) => extracted.some((b) => b._id === id));

  return (
    <div className="app-shell">
      <Navbar />

      <section className="hero-banner">
        <div className="container hero-inner">
          <div className="hero-text">
            <span className="hero-eyebrow">AI travel planner</span>
            <h1>Plan your trip abroad in minutes</h1>
            <p>
              Upload flight tickets, hotel confirmations, or train passes — we extract the details
              and build a day-by-day itinerary you can share with anyone.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-pill">
              <strong>{bookings.length}</strong>
              <span>Documents</span>
            </div>
            <div className="stat-pill">
              <strong>{extracted.length}</strong>
              <span>Ready</span>
            </div>
            <div className="stat-pill">
              <strong>{itineraries.length}</strong>
              <span>Itineraries</span>
            </div>
          </div>
        </div>
      </section>

      <div className="container dashboard-body">
        <div className="steps-strip">
          <div className="step active">
            <span className="step-num">1</span>
            <div>
              <strong>Upload</strong>
              <small>PDF or image</small>
            </div>
          </div>
          <div className={`step ${extracted.length ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <div>
              <strong>Extract</strong>
              <small>AI reads bookings</small>
            </div>
          </div>
          <div className={`step ${itineraries.length ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <div>
              <strong>Generate</strong>
              <small>Share itinerary</small>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          <section className="card card-elevated">
            <div className="card-head">
              <h2>Upload booking</h2>
              <p>Flights · Hotels · Trains · Bus passes</p>
            </div>
            <FileUpload onUploaded={() => load()} />
          </section>

          <section className="card card-elevated card-accent">
            <div className="card-head">
              <h2>Build itinerary</h2>
              <p>Select processed documents, then generate your trip plan</p>
            </div>
            {error && <p className="error-msg">{error}</p>}
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={!canGenerate || generating}
              onClick={handleGenerate}
            >
              {generating ? 'Creating your trip plan…' : `Generate itinerary (${selected.length} selected)`}
            </button>
            <p className="card-hint">
              {extracted.length === 0
                ? 'Upload a document and wait until status shows Ready.'
                : `${extracted.length} document(s) ready for planning.`}
            </p>
          </section>
        </div>

        <div className="dashboard-split">
          <section className="card">
            <div className="card-head row-between">
              <div>
                <h2>Your bookings</h2>
                <p>Tickets and confirmations you uploaded</p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🧳</span>
                <h3>No bookings yet</h3>
                <p>Drop a flight e-ticket or hotel voucher to get started.</p>
              </div>
            ) : (
              <ul className="booking-list">
                {bookings.map((b) => (
                  <li key={b._id} className={`booking-row ${selected.includes(b._id) ? 'selected' : ''}`}>
                    <label className="booking-row-inner">
                      <input
                        type="checkbox"
                        checked={selected.includes(b._id)}
                        disabled={b.status !== 'extracted'}
                        onChange={() => toggleSelect(b._id)}
                      />
                      <span className="booking-icon">{DOC_ICONS[b.documentType] || DOC_ICONS.other}</span>
                      <div className="booking-info">
                        <h4>{b.originalName}</h4>
                        <p>
                          {b.documentType} ·{' '}
                          {b.extractedData?.destination ||
                            b.extractedData?.origin ||
                            (b.status === 'processing' ? 'Analyzing with AI…' : '—')}
                        </p>
                        {b.extractedData?.confirmationNumber && (
                          <span className="booking-ref">Ref: {b.extractedData.confirmationNumber}</span>
                        )}
                        {b.status === 'failed' && (
                          <div className="booking-error">
                            <span>{b.errorMessage}</span>
                            <button
                              type="button"
                              className="btn btn-secondary btn-sm"
                              onClick={(e) => handleRetry(b._id, e)}
                            >
                              Retry
                            </button>
                          </div>
                        )}
                      </div>
                      <span className={`badge badge-${b.status}`}>
                        {b.status === 'processing' && <span className="pulse-dot" />}
                        {statusLabel(b.status)}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card">
            <div className="card-head">
              <h2>Trip history</h2>
              <p>Previously generated itineraries</p>
            </div>

            {itineraries.length === 0 ? (
              <div className="empty-state compact">
                <span className="empty-icon">🗺️</span>
                <h3>No trips yet</h3>
                <p>Your AI itineraries will appear here.</p>
              </div>
            ) : (
              <div className="itinerary-grid">
                {itineraries.map((it) => (
                  <Link key={it._id} to={`/itinerary/${it._id}`} className="trip-card">
                    <div className="trip-card-bg" />
                    <div className="trip-card-body">
                      <h3>{it.title}</h3>
                      <p>{it.destination || 'Destination TBD'}</p>
                      <div className="trip-card-footer">
                        <span>View plan →</span>
                        <time>{new Date(it.createdAt).toLocaleDateString()}</time>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <footer className="app-footer">
        <p>
          TripForge — inspired by global travel platforms. Secure uploads · AI-powered planning ·
          One-click sharing.
        </p>
      </footer>
    </div>
  );
}

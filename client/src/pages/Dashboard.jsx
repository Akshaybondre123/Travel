import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [itineraries, setItineraries] = useState([]);
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [bRes, iRes] = await Promise.all([
      api.get('/bookings'),
      api.get('/itineraries'),
    ]);
    setBookings(bRes.data);
    setItineraries(iRes.data);
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
  const canGenerate = selected.length > 0 && selected.every((id) =>
    extracted.some((b) => b._id === id)
  );

  return (
    <div className="app-shell">
      <div className="container">
        <Navbar />
        <header className="page-header">
          <h1>Your trips</h1>
          <p>Upload travel documents, extract booking details with AI, and generate day-by-day itineraries.</p>
        </header>

        <div className="grid-2" style={{ marginBottom: '2rem' }}>
          <section className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Upload booking</h2>
            <FileUpload onUploaded={() => load()} />
          </section>

          <section className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Generate itinerary</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '1rem', fontSize: '0.95rem' }}>
              Select processed bookings below, then generate a unified AI itinerary.
            </p>
            {error && <p className="error-msg">{error}</p>}
            <button
              type="button"
              className="btn btn-primary"
              disabled={!canGenerate || generating}
              onClick={handleGenerate}
            >
              {generating ? 'Generating with Gemini…' : `Generate from ${selected.length || 0} booking(s)`}
            </button>
          </section>
        </div>

        <section className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Uploaded bookings</h2>
          {bookings.length === 0 ? (
            <div className="empty-state">No documents yet. Upload a flight or hotel confirmation to start.</div>
          ) : (
            bookings.map((b) => (
              <label key={b._id} className="booking-item">
                <input
                  type="checkbox"
                  checked={selected.includes(b._id)}
                  disabled={b.status !== 'extracted'}
                  onChange={() => toggleSelect(b._id)}
                />
                <div className="booking-meta">
                  <h4>{b.originalName}</h4>
                  <small>
                    {b.documentType} ·{' '}
                    {b.extractedData?.destination || b.extractedData?.origin || 'Processing…'}
                  </small>
                  {b.status === 'extracted' && b.extractedData?.confirmationNumber && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
                      Ref: {b.extractedData.confirmationNumber}
                    </div>
                  )}
                  {b.status === 'failed' && (
                    <div style={{ color: 'var(--danger)', fontSize: '0.85rem' }}>{b.errorMessage}</div>
                  )}
                </div>
                <span className={`badge badge-${b.status}`}>{b.status}</span>
              </label>
            ))
          )}
        </section>

        <section className="card">
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Itinerary history</h2>
          {itineraries.length === 0 ? (
            <div className="empty-state">Generated itineraries will appear here.</div>
          ) : (
            itineraries.map((it) => (
              <Link key={it._id} to={`/itinerary/${it._id}`} className="itinerary-card">
                <h3>{it.title}</h3>
                <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
                  {it.destination || 'Trip'} · {new Date(it.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

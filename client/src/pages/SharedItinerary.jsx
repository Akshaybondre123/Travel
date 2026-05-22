import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
      <div className="auth-page">
        <div className="card auth-card" style={{ textAlign: 'center' }}>
          <h1>Not found</h1>
          <p style={{ color: 'var(--muted)' }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!itinerary) return <div className="loading-screen">Loading shared trip…</div>;

  return (
    <div className="app-shell">
      <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
        <p style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: '0.5rem' }}>
          Shared by {itinerary.user?.name || 'a traveler'}
        </p>
        <header className="page-header">
          <h1>{itinerary.title}</h1>
          <p>{itinerary.destination} · AI-generated itinerary</p>
        </header>
        <div className="card">
          <ItineraryView itinerary={itinerary} />
        </div>
        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--muted)' }}>
          Powered by <strong style={{ color: 'var(--text)' }}>TripForge</strong>
        </p>
      </div>
    </div>
  );
}

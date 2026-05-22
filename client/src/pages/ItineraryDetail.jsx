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
    api.get(`/itineraries/${id}`).then((res) => {
      setItinerary(res.data);
      setLoading(false);
    });
  }, [id]);

  const shareUrl = itinerary
    ? `${window.location.origin}/share/${itinerary.shareId}`
    : '';

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="loading-screen">Loading itinerary…</div>;
  if (!itinerary) return <div className="loading-screen">Itinerary not found</div>;

  return (
    <div className="app-shell">
      <div className="container">
        <Navbar />
        <Link to="/" className="btn btn-ghost" style={{ marginBottom: '1rem', display: 'inline-block' }}>
          ← Back to dashboard
        </Link>
        <header className="page-header">
          <h1>{itinerary.title}</h1>
          <p>
            {itinerary.destination}
            {itinerary.startDate &&
              ` · ${new Date(itinerary.startDate).toLocaleDateString()} – ${itinerary.endDate ? new Date(itinerary.endDate).toLocaleDateString() : ''}`}
          </p>
        </header>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Share this trip</h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
            Anyone with this link can view your itinerary — great for travel companions.
          </p>
          <div className="share-bar">
            <input readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
            <button type="button" className="btn btn-secondary" onClick={copyLink}>
              {copied ? 'Copied!' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="card">
          <ItineraryView itinerary={itinerary} />
        </div>
      </div>
    </div>
  );
}

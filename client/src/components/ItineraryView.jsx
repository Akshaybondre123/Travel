export default function ItineraryView({ itinerary, showSummary = true }) {
  const getActivityIcon = (title) => {
    const t = (title || '').toLowerCase();
    if (t.includes('flight') || t.includes('airport') || t.includes('fly') || t.includes('depart') || t.includes('arrive')) return '✈️';
    if (t.includes('hotel') || t.includes('check-in') || t.includes('check-out') || t.includes('stay') || t.includes('hostel') || t.includes('lodging')) return '🏨';
    if (t.includes('train') || t.includes('railway') || t.includes('metro') || t.includes('subway') || t.includes('transit')) return '🚆';
    if (t.includes('dinner') || t.includes('lunch') || t.includes('breakfast') || t.includes('eat') || t.includes('food') || t.includes('restaurant') || t.includes('cafe') || t.includes('bar')) return '🍴';
    if (t.includes('museum') || t.includes('tour') || t.includes('explore') || t.includes('sight') || t.includes('park') || t.includes('beach') || t.includes('visit') || t.includes('palace')) return '🏛️';
    return '📍';
  };

  return (
    <div>
      {itinerary.isFallback && (
        <div className="fallback-banner">
          <span className="fallback-banner-icon">⚠️</span>
          <div>
            <strong>AI limit reached — showing offline plan</strong>
            <p>The Gemini AI API was offline or rate-limited. This itinerary was created using offline heuristics. Please regenerate later for a tailored plan.</p>
          </div>
        </div>
      )}
      {showSummary && itinerary.summary && (
        <p style={{ color: 'var(--muted)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {itinerary.summary}
        </p>
      )}

      <div className="itinerary-timeline">
        {(itinerary.days || []).map((day, i) => (
          <div key={i} className="itinerary-day">
            <div className="itinerary-day-marker"></div>
            <h3>
              {day.date} — {day.title}
            </h3>
            <div className="activities-container">
              {(day.activities || []).map((act, j) => (
                <div key={j} className="activity">
                  <div className="activity-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{getActivityIcon(act.title)}</span>
                      <strong className="activity-title">{act.title}</strong>
                    </div>
                    {act.time && <span className="activity-time">{act.time}</span>}
                  </div>
                  {act.location && (
                    <div className="activity-location">
                      <span>📍</span> {act.location}
                    </div>
                  )}
                  {act.description && <p className="activity-description">{act.description}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {itinerary.tips?.length > 0 && (
        <div className="tips-container">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>💡 Travel tips & recommendations</h3>
          <ul className="tips-list">
            {itinerary.tips.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

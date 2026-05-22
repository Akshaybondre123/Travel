export default function ItineraryView({ itinerary }) {
  return (
    <div>
      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>{itinerary.summary}</p>
      {(itinerary.days || []).map((day, i) => (
        <div key={i} className="itinerary-day">
          <h3>
            {day.date} — {day.title}
          </h3>
          {(day.activities || []).map((act, j) => (
            <div key={j} className="activity">
              <div className="activity-time">{act.time}</div>
              <strong>{act.title}</strong>
              {act.location && (
                <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{act.location}</div>
              )}
              {act.description && <p style={{ marginTop: '0.35rem' }}>{act.description}</p>}
            </div>
          ))}
        </div>
      ))}
      {itinerary.tips?.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Travel tips</h3>
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

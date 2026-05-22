/** Rule-based fallback when Gemini quota/API is unavailable */

export function fallbackExtract(text) {
  const ref = text.match(/(?:booking\s*reference|confirmation|ref)[:\s#]*([A-Z0-9-]+)/i);
  const passenger = text.match(/(?:passenger|guest|name)[:\s]+([A-Za-z ]{2,40})/i);
  const from = text.match(/(?:from)[:\s]+([^(]+?)(?:\s*\(|$)/i);
  const to = text.match(/(?:to)[:\s]+([^(]+?)(?:\s*\(|$)/i);
  const flight = text.match(/(?:flight)[:\s#]*([A-Z]{0,3}\s?\d{2,4})/i);
  const date = text.match(/(\d{1,2}\s+[A-Za-z]+\s+\d{4})/g);
  const provider = text.match(/^([A-Z][A-Z\s]+)(?:\s+CONFIRMATION|AIRLINE|HOTEL)/m);

  const isHotel = /hotel|room|check-in/i.test(text);
  const isFlight = /flight|airline|departure|arrival/i.test(text);

  return {
    documentType: isHotel ? 'hotel' : isFlight ? 'flight' : 'other',
    travelerName: passenger?.[1]?.trim() || null,
    destination: to?.[1]?.trim() || null,
    origin: from?.[1]?.trim() || null,
    startDate: date?.[0] || null,
    endDate: date?.[1] || null,
    confirmationNumber: ref?.[1] || null,
    provider: provider?.[1]?.trim() || null,
    details: {
      flightNumber: flight?.[1]?.trim() || null,
      departure: from?.[1]?.trim() || null,
      arrival: to?.[1]?.trim() || null,
      hotelName: isHotel ? provider?.[1]?.trim() : null,
      address: null,
      roomType: null,
      seatOrRoom: text.match(/seat[:\s]+(\S+)/i)?.[1] || null,
    },
    notes: 'Extracted via offline fallback parser',
  };
}

export function fallbackItinerary(bookings) {
  const first = bookings[0]?.extractedData || {};
  const dest = first.destination || 'Your Destination';
  const start = first.startDate || 'Day 1';
  const end = first.endDate || start;

  const days = [];
  const addDay = (label, activities) => days.push({ date: label, title: `Exploring ${dest}`, activities });

  addDay(String(start), [
    {
      time: '08:00',
      title: 'Arrival & check-in',
      description: 'Settle in and refresh after travel.',
      location: dest,
      type: 'hotel',
    },
    {
      time: '12:00',
      title: 'Local lunch',
      description: 'Try a popular restaurant near your stay.',
      location: dest,
      type: 'food',
    },
    {
      time: '15:00',
      title: 'City highlights',
      description: 'Visit top attractions based on your booking location.',
      location: dest,
      type: 'sightseeing',
    },
  ]);

  if (end !== start) {
    addDay(String(end), [
      {
        time: '10:00',
        title: 'Departure preparation',
        description: 'Pack and head to airport/station per your booking.',
        location: first.origin || dest,
        type: 'transport',
      },
    ]);
  }

  bookings.forEach((b) => {
    const d = b.extractedData;
    if (d?.details?.flightNumber && days[0]) {
      days[0] = {
        ...days[0],
        activities: [
          {
            time: '06:00',
            title: `Flight ${d.details.flightNumber}`,
            description: `${d.origin || ''} → ${d.destination || ''}`,
            location: d.origin || dest,
            type: 'flight',
          },
          ...days[0].activities,
        ],
      };
    }
  });

  return {
    title: `Trip to ${dest}`,
    destination: dest,
    startDate: first.startDate,
    endDate: first.endDate,
    summary: `A practical itinerary for ${dest} built from your uploaded bookings (${bookings.length} document(s)).`,
    days,
    tips: [
      'Keep digital and printed copies of all confirmations.',
      'Arrive at the airport at least 2 hours before international departures.',
      'Save offline maps for your destination.',
    ],
  };
}

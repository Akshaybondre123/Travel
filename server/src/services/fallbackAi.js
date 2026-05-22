/** Rule-based fallback when Gemini is unavailable */

export function fallbackExtract(text) {
  const ref = text.match(/(?:booking\s*reference|confirmation|ref|receipt)[:\s#]*([A-Z0-9-]+)/i);
  const passenger = text.match(/(?:passenger|guest|name|applicant)[:\s]+([A-Za-z][A-Za-z\s]{1,38})/i);
  const from = text.match(/(?:from|departure)[:\s]+([A-Za-z0-9\s,]+?)(?:\n|to|$)/i);
  const to = text.match(/(?:to|arrival|destination)[:\s]+([A-Za-z0-9\s,]+?)(?:\n|from|$)/i);
  const flight = text.match(/(?:flight)[:\s#]*([A-Z]{0,3}\s?\d{2,4})/i);
  const dates = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{1,2}\s+[A-Za-z]+\s+\d{4})/g);

  const isHotel = /hotel|room|check-in/i.test(text);
  const isFlight = /flight|airline|departure|arrival/i.test(text);

  return {
    documentType: isHotel ? 'hotel' : isFlight ? 'flight' : 'other',
    travelerName: passenger?.[1]?.trim() || null,
    destination: to?.[1]?.trim() || null,
    origin: from?.[1]?.trim() || null,
    startDate: dates?.[0] || null,
    endDate: dates?.[1] || null,
    confirmationNumber: ref?.[1] || null,
    provider: null,
    details: {
      flightNumber: flight?.[1]?.trim() || null,
      departure: from?.[1]?.trim() || null,
      arrival: to?.[1]?.trim() || null,
      hotelName: null,
      address: null,
      roomType: null,
      seatOrRoom: null,
    },
    notes: 'Extracted via offline fallback parser',
  };
}

export function fallbackItinerary(bookings) {
  const first = bookings[0]?.extractedData || {};
  const dest = first.destination || 'Your Destination';
  const start = first.startDate || 'Day 1';
  const end = first.endDate || start;

  const days = [
    {
      date: String(start),
      title: `Exploring ${dest}`,
      activities: [
        {
          time: '08:00',
          title: 'Arrival & check-in',
          description: 'Settle in after travel.',
          location: dest,
          type: 'hotel',
        },
        {
          time: '15:00',
          title: 'Local sightseeing',
          description: 'Explore highlights near your booking.',
          location: dest,
          type: 'sightseeing',
        },
      ],
    },
  ];

  if (end !== start) {
    days.push({
      date: String(end),
      title: 'Departure day',
      activities: [
        {
          time: '10:00',
          title: 'Departure',
          description: 'Head to airport or station per your booking.',
          location: first.origin || dest,
          type: 'transport',
        },
      ],
    });
  }

  return {
    title: `Trip to ${dest}`,
    destination: dest,
    startDate: first.startDate,
    endDate: first.endDate,
    summary: `Itinerary built from ${bookings.length} uploaded document(s).`,
    days,
    tips: ['Keep copies of all travel confirmations.', 'Arrive early for international flights.'],
    isFallback: true,
  };
}

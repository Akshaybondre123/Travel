import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';
import { getFileBuffer } from './storage.js';
import { fallbackExtract, fallbackItinerary } from './fallbackAi.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = (process.env.GEMINI_MODEL || 'gemini-1.5-flash,gemini-1.5-flash-8b,gemini-2.0-flash')
  .split(',')
  .map((m) => m.trim())
  .filter(Boolean);

const EXTRACTION_PROMPT = `You are a travel document parser. Analyze the provided travel booking content and extract structured JSON only (no markdown).

Return this exact JSON shape:
{
  "documentType": "flight" | "hotel" | "train" | "bus" | "other",
  "travelerName": "string or null",
  "destination": "string or null",
  "origin": "string or null",
  "startDate": "ISO date string or null",
  "endDate": "ISO date string or null",
  "confirmationNumber": "string or null",
  "provider": "airline/hotel/vendor name or null",
  "details": {
    "flightNumber": "string or null",
    "departure": "string or null",
    "arrival": "string or null",
    "hotelName": "string or null",
    "address": "string or null",
    "roomType": "string or null",
    "seatOrRoom": "string or null"
  },
  "notes": "any other relevant info"
}`;

const ITINERARY_PROMPT = (bookings) => `You are an expert travel planner. Using these extracted booking records, create a cohesive day-by-day travel itinerary.

Bookings JSON:
${JSON.stringify(bookings, null, 2)}

Return ONLY valid JSON (no markdown) in this shape:
{
  "title": "Trip title",
  "destination": "main destination",
  "startDate": "ISO date or null",
  "endDate": "ISO date or null",
  "summary": "2-3 sentence overview",
  "days": [
    {
      "date": "YYYY-MM-DD or Day 1",
      "title": "day theme",
      "activities": [
        {
          "time": "09:00",
          "title": "activity name",
          "description": "details",
          "location": "place",
          "type": "flight|hotel|sightseeing|food|transport|rest"
        }
      ]
    }
  ],
  "tips": ["practical tip 1", "tip 2"]
}

Fill gaps with reasonable suggestions near booked locations. Respect actual booking times when present.`;

function parseJsonFromText(text) {
  const cleaned = text.replace(/```json|```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON found in AI response');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function generateWithFallback(parts, { useFallback }) {
  const errors = [];
  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(parts);
      return parseJsonFromText(result.response.text());
    } catch (err) {
      errors.push(`${modelName}: ${err.message}`);
    }
  }
  if (useFallback) return null;
  throw new Error(errors.join(' | '));
}

export async function extractFromDocument({ mimeType, fileUrl, localPath, storageKey }) {
  const buffer = await getFileBuffer({ mimeType, fileUrl, localPath, storageKey });

  let textContent = '';
  if (mimeType === 'application/pdf') {
    const parsed = await pdf(buffer);
    textContent = parsed.text;
  } else if (mimeType.startsWith('image/')) {
    const base64 = buffer.toString('base64');
    const ai = await generateWithFallback(
      [{ text: EXTRACTION_PROMPT }, { inlineData: { mimeType, data: base64 } }],
      { useFallback: true }
    );
    if (ai) return ai;
    throw new Error('Image extraction requires a working Gemini API key');
  } else {
    textContent = buffer.toString('utf8');
  }

  if (!textContent.trim()) throw new Error('Could not read text from document');

  const ai = await generateWithFallback(
    [EXTRACTION_PROMPT, `\n\nDocument text:\n${textContent.slice(0, 12000)}`],
    { useFallback: true }
  );
  if (ai) return ai;

  return fallbackExtract(textContent);
}

function isValidItinerary(ai) {
  if (!ai?.days?.length) return false;
  return ai.days.every(
    (day) => Array.isArray(day.activities) && day.activities.every((a) => typeof a === 'object' && a?.title)
  );
}

export async function generateItinerary(bookings) {
  const payload = bookings.map((b) => ({
    file: b.originalName,
    type: b.documentType,
    data: b.extractedData,
  }));

  const ai = await generateWithFallback([ITINERARY_PROMPT(payload)], { useFallback: true });
  if (ai && isValidItinerary(ai)) return ai;

  return fallbackItinerary(bookings);
}

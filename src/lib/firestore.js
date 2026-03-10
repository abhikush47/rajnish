/**
 * Lightweight Firestore REST helper — no Firebase SDK bundle needed.
 * Saves ~150KB of JS and eliminates cold-start delay.
 *
 * Usage:
 *   import { saveDoc } from '@/lib/firestore';
 *   await saveDoc('volunteers', { name: 'Ram', phone: '98...' });
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const API_KEY    = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

/**
 * Convert a plain JS object to Firestore REST "fields" format
 */
function toFields(data) {
  const fields = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (typeof value === 'number') {
      fields[key] = { integerValue: String(value) };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map(v => ({ stringValue: String(v) })),
        },
      };
    } else {
      fields[key] = { stringValue: String(value) };
    }
  }
  return fields;
}

/**
 * Save a document to a Firestore collection via REST (no SDK).
 * Returns the created document name/id.
 */
export async function saveDoc(collectionName, data) {
  if (!PROJECT_ID || !API_KEY) {
    throw new Error(
      'MISSING_ENV: Add NEXT_PUBLIC_FIREBASE_PROJECT_ID and NEXT_PUBLIC_FIREBASE_API_KEY to your .env.local file, then restart the dev server.'
    );
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionName}?key=${API_KEY}`;

  const body = {
    fields: toFields({
      ...data,
      createdAt: new Date().toISOString(), // client timestamp — instant, no round-trip
      status: 'pending',
    }),
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Firestore error: ${res.status}`);
  }

  const result = await res.json();
  // Extract the auto-generated document ID from the name field
  const docId = result.name?.split('/').pop();
  return docId;
}
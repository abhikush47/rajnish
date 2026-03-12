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

/**
 * Parse a single Firestore REST document into a plain JS object
 */
function parseDoc(doc) {
  const id = doc.name?.split('/').pop();
  const data = {};
  for (const [key, val] of Object.entries(doc.fields || {})) {
    if ('stringValue'  in val) data[key] = val.stringValue;
    else if ('integerValue' in val) data[key] = Number(val.integerValue);
    else if ('booleanValue' in val) data[key] = val.booleanValue;
    else if ('nullValue'    in val) data[key] = null;
    else if ('arrayValue'   in val)
      data[key] = (val.arrayValue.values || []).map(v => v.stringValue ?? v.integerValue ?? null);
    else data[key] = null;
  }
  return { id, ...data };
}

/**
 * Fetch documents from a collection ordered by createdAt descending.
 * Uses Firestore REST runQuery — no SDK needed.
 */
export async function fetchDocs(collectionName, limitCount = 10) {
  if (!PROJECT_ID || !API_KEY) {
    throw new Error('MISSING_ENV: Firebase env variables not set.');
  }

  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery?key=${API_KEY}`;

  const body = {
    structuredQuery: {
      from: [{ collectionId: collectionName }],
      orderBy: [{ field: { fieldPath: 'createdAt' }, direction: 'DESCENDING' }],
      limit: limitCount,
    },
  };

  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Firestore fetch error: ${res.status}`);
  }

  const rows = await res.json();
  return rows
    .filter(r => r.document)
    .map(r => parseDoc(r.document));
}

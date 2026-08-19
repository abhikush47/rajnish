import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

let pool;

if (!pool) {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.warn('[Social Videos] DATABASE_URL is not defined. Queries will fail.');
  }
  pool = new Pool({
    connectionString,
    ssl: connectionString && (connectionString.includes('localhost') || connectionString.includes('127.0.0.1'))
      ? false
      : { rejectUnauthorized: false }
  });
}

let isInitialized = false;

// Auto-run schema creation & seeding
export async function initDb() {
  if (isInitialized) return;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create connect_requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS connect_requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        palika TEXT NOT NULL,
        ward TEXT NOT NULL,
        contact TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create volunteers table
    await client.query(`
      CREATE TABLE IF NOT EXISTS volunteers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT,
        village TEXT NOT NULL,
        interests TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create feedback table
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'unread',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create social_videos table
    await client.query(`
      CREATE TABLE IF NOT EXISTS social_videos (
        id TEXT PRIMARY KEY,
        title_en TEXT NOT NULL,
        description_en TEXT NOT NULL,
        title_ne TEXT NOT NULL,
        description_ne TEXT NOT NULL,
        video_url TEXT NOT NULL,
        platform TEXT NOT NULL,
        cover_image_url TEXT,
        cover_source TEXT DEFAULT 'auto',
        status TEXT NOT NULL DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query('COMMIT');
    console.log('[Social Videos] Database connected & tables initialized');
    isInitialized = true;

    // Optional One-time migration from data/db.json
    try {
      const videoCheck = await client.query('SELECT COUNT(*) FROM social_videos;');
      const videoCount = parseInt(videoCheck.rows[0].count, 10);
      
      if (videoCount === 0) {
        const BUNDLED_DB = path.join(process.cwd(), 'data', 'db.json');
        if (fs.existsSync(BUNDLED_DB)) {
          const raw = fs.readFileSync(BUNDLED_DB, 'utf8');
          const db = JSON.parse(raw);
          console.log('[Social Videos] Migration source data/db.json found. Migrating records...');

          if (db.connect_requests) {
            for (const r of db.connect_requests) {
              await client.query(
                `INSERT INTO connect_requests (id, name, palika, ward, contact, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT (id) DO NOTHING;`,
                [r.id, r.name, r.palika, r.ward, r.contact, r.status, r.createdAt || new Date()]
              );
            }
          }
          if (db.volunteers) {
            for (const v of db.volunteers) {
              await client.query(
                `INSERT INTO volunteers (id, name, phone, email, village, interests, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING;`,
                [v.id, v.name, v.phone, v.email || '', v.village, v.interests || '', v.status, v.createdAt || new Date()]
              );
            }
          }
          if (db.feedback) {
            for (const f of db.feedback) {
              await client.query(
                `INSERT INTO feedback (id, name, email, message, status, created_at) 
                 VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (id) DO NOTHING;`,
                [f.id, f.name, f.email, f.message, f.status, f.createdAt || new Date()]
              );
            }
          }
          if (db.social_videos) {
            for (const sv of db.social_videos) {
              await client.query(
                `INSERT INTO social_videos (id, title_en, description_en, title_ne, description_ne, video_url, platform, cover_image_url, cover_source, status, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) ON CONFLICT (id) DO NOTHING;`,
                [sv.id, sv.title_en, sv.description_en, sv.title_ne, sv.description_ne, sv.video_url, sv.platform, sv.cover_image_url, sv.cover_source || 'auto', sv.status, sv.createdAt || new Date(), sv.updatedAt || new Date()]
              );
            }
          }
          console.log('[Social Videos] Migration from db.json completed successfully!');
        }
      }
    } catch (migError) {
      console.warn('[Social Videos] Migration skipped or failed:', migError.message);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Social Videos] Database initialization error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

export async function getConnectRequests() {
  await initDb();
  const res = await pool.query('SELECT * FROM connect_requests ORDER BY created_at DESC;');
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    palika: row.palika,
    ward: row.ward,
    contact: row.contact,
    status: row.status,
    createdAt: row.created_at
  }));
}

export async function addConnectRequest(entry) {
  await initDb();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const status = 'pending';
  const query = `
    INSERT INTO connect_requests (id, name, palika, ward, contact, status)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const res = await pool.query(query, [id, entry.name, entry.palika, entry.ward, entry.contact, status]);
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    palika: row.palika,
    ward: row.ward,
    contact: row.contact,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function updateConnectRequestStatus(id, status) {
  await initDb();
  const query = 'UPDATE connect_requests SET status = $1 WHERE id = $2 RETURNING *;';
  const res = await pool.query(query, [status, id]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      palika: row.palika,
      ward: row.ward,
      contact: row.contact,
      status: row.status,
      createdAt: row.created_at
    };
  }
  throw new Error('Connect request not found');
}

export async function getVolunteers() {
  await initDb();
  const res = await pool.query('SELECT * FROM volunteers ORDER BY created_at DESC;');
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    village: row.village,
    interests: row.interests,
    status: row.status,
    createdAt: row.created_at
  }));
}

export async function addVolunteer(entry) {
  await initDb();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const status = 'pending';
  const query = `
    INSERT INTO volunteers (id, name, phone, email, village, interests, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const res = await pool.query(query, [id, entry.name, entry.phone, entry.email || '', entry.village, entry.interests || '', status]);
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    email: row.email,
    village: row.village,
    interests: row.interests,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function updateVolunteerStatus(id, status) {
  await initDb();
  const query = 'UPDATE volunteers SET status = $1 WHERE id = $2 RETURNING *;';
  const res = await pool.query(query, [status, id]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      phone: row.phone,
      email: row.email,
      village: row.village,
      interests: row.interests,
      status: row.status,
      createdAt: row.created_at
    };
  }
  throw new Error('Volunteer application not found');
}

export async function getFeedback() {
  await initDb();
  const res = await pool.query('SELECT * FROM feedback ORDER BY created_at DESC;');
  return res.rows.map(row => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  }));
}

export async function addFeedback(entry) {
  await initDb();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const status = 'unread';
  const query = `
    INSERT INTO feedback (id, name, email, message, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const res = await pool.query(query, [id, entry.name, entry.email, entry.message, status]);
  const row = res.rows[0];
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at
  };
}

export async function updateFeedbackStatus(id, status) {
  await initDb();
  const query = 'UPDATE feedback SET status = $1 WHERE id = $2 RETURNING *;';
  const res = await pool.query(query, [status, id]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      message: row.message,
      status: row.status,
      createdAt: row.created_at
    };
  }
  throw new Error('Feedback not found');
}

export async function getSocialVideos() {
  await initDb();
  const res = await pool.query('SELECT * FROM social_videos ORDER BY created_at DESC;');
  return res.rows.map(row => ({
    id: row.id,
    title_en: row.title_en,
    description_en: row.description_en,
    title_ne: row.title_ne,
    description_ne: row.description_ne,
    video_url: row.video_url,
    platform: row.platform,
    cover_image_url: row.cover_image_url,
    cover_source: row.cover_source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  }));
}

export async function addSocialVideo(entry) {
  await initDb();
  const id = `sv_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const status = 'draft';
  const query = `
    INSERT INTO social_videos (id, title_en, description_en, title_ne, description_ne, video_url, platform, cover_image_url, cover_source, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *;
  `;
  const res = await pool.query(query, [
    id,
    entry.title_en,
    entry.description_en,
    entry.title_ne,
    entry.description_ne,
    entry.video_url,
    entry.platform,
    entry.cover_image_url || '',
    entry.cover_source || 'auto',
    status
  ]);
  const row = res.rows[0];
  return {
    id: row.id,
    title_en: row.title_en,
    description_en: row.description_en,
    title_ne: row.title_ne,
    description_ne: row.description_ne,
    video_url: row.video_url,
    platform: row.platform,
    cover_image_url: row.cover_image_url,
    cover_source: row.cover_source,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function updateSocialVideo(id, entry) {
  await initDb();
  const keys = Object.keys(entry);
  if (keys.length === 0) {
    throw new Error('No fields provided to update');
  }
  const setClause = keys.map((key, i) => `"${key}" = $${i + 2}`).join(', ');
  const values = keys.map(key => entry[key]);
  const query = `
    UPDATE social_videos
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;
  const res = await pool.query(query, [id, ...values]);
  if (res.rows.length > 0) {
    const row = res.rows[0];
    return {
      id: row.id,
      title_en: row.title_en,
      description_en: row.description_en,
      title_ne: row.title_ne,
      description_ne: row.description_ne,
      video_url: row.video_url,
      platform: row.platform,
      cover_image_url: row.cover_image_url,
      cover_source: row.cover_source,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
  throw new Error('Social video not found');
}

export async function deleteRecord(type, id) {
  await initDb();
  let tableName = '';
  if (type === 'connect' || type === 'connect_request') {
    tableName = 'connect_requests';
  } else if (type === 'volunteer') {
    tableName = 'volunteers';
  } else if (type === 'feedback') {
    tableName = 'feedback';
  } else if (type === 'social_video') {
    tableName = 'social_videos';
  } else {
    throw new Error('Invalid collection type for deletion');
  }

  const res = await pool.query(`DELETE FROM ${tableName} WHERE id = $1;`, [id]);
  return (res.rowCount || 0) > 0;
}

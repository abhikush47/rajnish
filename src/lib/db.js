import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

const usePostgres = !!process.env.DATABASE_URL;

let pool;
if (usePostgres) {
  // Hide credentials safely for debugging
  const dbHost = process.env.DATABASE_URL.split('@')[1] || 'unknown';
  console.log(`[Social Videos] Initializing database connection pool for host: ${dbHost}`);
  
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,                      // Optimize connection pool size for Vercel Serverless
    idleTimeoutMillis: 30000,      // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000  // Fail fast on network timeout (5 seconds)
  });
} else {
  console.log('[Social Videos] DATABASE_URL is not defined. Falling back to local JSON database.');
}

const BUNDLED_DB = path.join(process.cwd(), 'data', 'db.json');
const WRITABLE_DB = path.join('/tmp', 'db.json');

// --- JSON Local DB Fallback Helpers ---
function getJsonDbFilePath() {
  if (fs.existsSync(WRITABLE_DB)) {
    return WRITABLE_DB;
  }
  return BUNDLED_DB;
}

function initJsonDb() {
  if (!fs.existsSync(WRITABLE_DB)) {
    try {
      if (fs.existsSync(BUNDLED_DB)) {
        const data = fs.readFileSync(BUNDLED_DB, 'utf8');
        fs.writeFileSync(WRITABLE_DB, data, 'utf8');
      } else {
        const initialData = JSON.stringify({
          connect_requests: [],
          volunteers: [],
          feedback: [],
          social_videos: []
        }, null, 2);
        const parentDir = path.dirname(WRITABLE_DB);
        if (!fs.existsSync(parentDir)) {
          fs.mkdirSync(parentDir, { recursive: true });
        }
        fs.writeFileSync(WRITABLE_DB, initialData, 'utf8');
      }
    } catch (err) {
      console.warn('Could not initialize local JSON DB in /tmp:', err.message);
    }
  }
}

async function readJsonDb() {
  initJsonDb();
  try {
    const filePath = getJsonDbFilePath();
    const data = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    if (!parsed.connect_requests) parsed.connect_requests = [];
    if (!parsed.volunteers) parsed.volunteers = [];
    if (!parsed.feedback) parsed.feedback = [];
    if (!parsed.social_videos) parsed.social_videos = [];
    
    return parsed;
  } catch (error) {
    console.error('Error reading JSON DB:', error);
    return { connect_requests: [], volunteers: [], feedback: [], social_videos: [] };
  }
}

async function writeJsonDb(data) {
  try {
    const parentDir = path.dirname(WRITABLE_DB);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }
    await fs.promises.writeFile(WRITABLE_DB, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing JSON DB to /tmp:', error);
    try {
      await fs.promises.writeFile(BUNDLED_DB, JSON.stringify(data, null, 2), 'utf8');
    } catch (fallbackError) {
      console.error('Error writing to bundled DB:', fallbackError);
    }
  }
}

// --- PostgreSQL Initialization Helper ---
let isInitialized = false;

export async function initDb() {
  if (!usePostgres || isInitialized) return;

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
    console.log('[Social Videos] PostgreSQL database connected & tables initialized');
    isInitialized = true;

    // Seeding migration from db.json
    try {
      const videoCheck = await client.query('SELECT COUNT(*) FROM social_videos;');
      const videoCount = parseInt(videoCheck.rows[0].count, 10);
      
      if (videoCount === 0) {
        if (fs.existsSync(BUNDLED_DB)) {
          const raw = fs.readFileSync(BUNDLED_DB, 'utf8');
          const db = JSON.parse(raw);
          console.log('[Social Videos] Migrating historical records to PostgreSQL...');

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

// --- CRUD HANDLERS ---

export async function getConnectRequests() {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    return db.connect_requests || [];
  }
}

export async function addConnectRequest(entry) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...entry
    };
    db.connect_requests.push(newEntry);
    await writeJsonDb(db);
    return newEntry;
  }
}

export async function updateConnectRequestStatus(id, status) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const index = db.connect_requests.findIndex(item => item.id === id);
    if (index !== -1) {
      db.connect_requests[index].status = status;
      await writeJsonDb(db);
      return db.connect_requests[index];
    }
    throw new Error('Connect request not found');
  }
}

export async function getVolunteers() {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    return db.volunteers || [];
  }
}

export async function addVolunteer(entry) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
      ...entry
    };
    db.volunteers.push(newEntry);
    await writeJsonDb(db);
    return newEntry;
  }
}

export async function updateVolunteerStatus(id, status) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const index = db.volunteers.findIndex(item => item.id === id);
    if (index !== -1) {
      db.volunteers[index].status = status;
      await writeJsonDb(db);
      return db.volunteers[index];
    }
    throw new Error('Volunteer application not found');
  }
}

export async function getFeedback() {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    return db.feedback || [];
  }
}

export async function addFeedback(entry) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const newEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'unread',
      ...entry
    };
    db.feedback.push(newEntry);
    await writeJsonDb(db);
    return newEntry;
  }
}

export async function updateFeedbackStatus(id, status) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const index = db.feedback.findIndex(item => item.id === id);
    if (index !== -1) {
      db.feedback[index].status = status;
      await writeJsonDb(db);
      return db.feedback[index];
    }
    throw new Error('Feedback not found');
  }
}

export async function getSocialVideos() {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    return db.social_videos || [];
  }
}

export async function addSocialVideo(entry) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const newEntry = {
      id: `sv_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'draft',
      ...entry
    };
    db.social_videos.push(newEntry);
    await writeJsonDb(db);
    return newEntry;
  }
}

export async function updateSocialVideo(id, entry) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    const index = db.social_videos.findIndex(item => item.id === id);
    if (index !== -1) {
      db.social_videos[index] = {
        ...db.social_videos[index],
        ...entry,
        updatedAt: new Date().toISOString()
      };
      await writeJsonDb(db);
      return db.social_videos[index];
    }
    throw new Error('Social video not found');
  }
}

export async function deleteRecord(type, id) {
  if (usePostgres) {
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
  } else {
    const db = await readJsonDb();
    let collectionName = '';
    
    if (type === 'connect' || type === 'connect_request') {
      collectionName = 'connect_requests';
    } else if (type === 'volunteer') {
      collectionName = 'volunteers';
    } else if (type === 'feedback') {
      collectionName = 'feedback';
    } else if (type === 'social_video') {
      collectionName = 'social_videos';
    } else {
      throw new Error('Invalid collection type for deletion');
    }

    const index = db[collectionName].findIndex(item => item.id === id);
    if (index !== -1) {
      db[collectionName].splice(index, 1);
      await writeJsonDb(db);
      return true;
    }
    throw new Error('Record not found');
  }
}

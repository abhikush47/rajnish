import fs from 'fs';
import path from 'path';

const BUNDLED_DB = path.join(process.cwd(), 'data', 'db.json');
const WRITABLE_DB = path.join('/tmp', 'db.json');

// Get active database file path
function getDbFilePath() {
  if (fs.existsSync(WRITABLE_DB)) {
    return WRITABLE_DB;
  }
  return BUNDLED_DB;
}

// Initialize database file
function initDb() {
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
        fs.writeFileSync(WRITABLE_DB, initialData, 'utf8');
      }
    } catch (err) {
      console.warn('Could not initialize database in /tmp, falling back to read-only bundled DB:', err.message);
    }
  }
}

// Read database helper
async function readDb() {
  initDb();
  try {
    const filePath = getDbFilePath();
    const data = await fs.promises.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure all collections exist
    if (!parsed.connect_requests) parsed.connect_requests = [];
    if (!parsed.volunteers) parsed.volunteers = [];
    if (!parsed.feedback) parsed.feedback = [];
    if (!parsed.social_videos) parsed.social_videos = [];
    
    return parsed;
  } catch (error) {
    console.error('Error reading database:', error);
    return { connect_requests: [], volunteers: [], feedback: [], social_videos: [] };
  }
}

// Write database helper
async function writeDb(data) {
  try {
    await fs.promises.writeFile(WRITABLE_DB, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database to /tmp:', error);
    try {
      await fs.promises.writeFile(BUNDLED_DB, JSON.stringify(data, null, 2), 'utf8');
    } catch (fallbackError) {
      console.error('Error writing to bundled DB:', fallbackError);
      throw new Error('Database write error: Read-only filesystem');
    }
  }
}

export async function getConnectRequests() {
  const db = await readDb();
  return db.connect_requests || [];
}

export async function addConnectRequest(entry) {
  const db = await readDb();
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending', // pending, contacted, approved, rejected
    ...entry
  };
  db.connect_requests.push(newEntry);
  await writeDb(db);
  return newEntry;
}

export async function updateConnectRequestStatus(id, status) {
  const db = await readDb();
  const index = db.connect_requests.findIndex(item => item.id === id);
  if (index !== -1) {
    db.connect_requests[index].status = status;
    await writeDb(db);
    return db.connect_requests[index];
  }
  throw new Error('Connect request not found');
}

export async function getVolunteers() {
  const db = await readDb();
  return db.volunteers || [];
}

export async function addVolunteer(entry) {
  const db = await readDb();
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'pending', // pending, contacted, approved, rejected
    ...entry
  };
  db.volunteers.push(newEntry);
  await writeDb(db);
  return newEntry;
}

export async function updateVolunteerStatus(id, status) {
  const db = await readDb();
  const index = db.volunteers.findIndex(item => item.id === id);
  if (index !== -1) {
    db.volunteers[index].status = status;
    await writeDb(db);
    return db.volunteers[index];
  }
  throw new Error('Volunteer application not found');
}

export async function getFeedback() {
  const db = await readDb();
  return db.feedback || [];
}

export async function addFeedback(entry) {
  const db = await readDb();
  const newEntry = {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    status: 'unread', // unread, read
    ...entry
  };
  db.feedback.push(newEntry);
  await writeDb(db);
  return newEntry;
}

export async function updateFeedbackStatus(id, status) {
  const db = await readDb();
  const index = db.feedback.findIndex(item => item.id === id);
  if (index !== -1) {
    db.feedback[index].status = status;
    await writeDb(db);
    return db.feedback[index];
  }
  throw new Error('Feedback not found');
}

// --- SOCIAL VIDEOS CRUD ---

export async function getSocialVideos() {
  const db = await readDb();
  return db.social_videos || [];
}

export async function addSocialVideo(entry) {
  const db = await readDb();
  const newEntry = {
    id: `sv_${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft', // draft, published
    ...entry
  };
  db.social_videos.push(newEntry);
  await writeDb(db);
  return newEntry;
}

export async function updateSocialVideo(id, entry) {
  const db = await readDb();
  const index = db.social_videos.findIndex(item => item.id === id);
  if (index !== -1) {
    db.social_videos[index] = {
      ...db.social_videos[index],
      ...entry,
      updatedAt: new Date().toISOString()
    };
    await writeDb(db);
    return db.social_videos[index];
  }
  throw new Error('Social video not found');
}

// --- UNIFIED DELETION ---

export async function deleteRecord(type, id) {
  const db = await readDb();
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
    await writeDb(db);
    return true;
  }
  throw new Error('Record not found');
}

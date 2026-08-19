import fs from 'fs';
import path from 'path';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Initialize database file
function initDb() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({
      connect_requests: [],
      volunteers: [],
      feedback: [],
      social_videos: []
    }, null, 2), 'utf8');
  }
}

// Read database helper
async function readDb() {
  initDb();
  try {
    const data = await fs.promises.readFile(DB_FILE, 'utf8');
    const parsed = JSON.parse(data);
    
    // Ensure all collections exist
    if (!parsed.connect_requests) parsed.connect_requests = [];
    if (!parsed.volunteers) parsed.volunteers = [];
    if (!parsed.feedback) parsed.feedback = [];
    if (!parsed.social_videos) parsed.social_videos = [];
    
    return parsed;
  } catch (error) {
    console.error('Error reading local db.json:', error);
    return { connect_requests: [], volunteers: [], feedback: [], social_videos: [] };
  }
}

// Write database helper
async function writeDb(data) {
  initDb();
  try {
    await fs.promises.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing local db.json:', error);
    throw new Error('Database write error');
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

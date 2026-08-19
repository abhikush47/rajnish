import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountJson) {
    throw new Error(
      'MISSING_FIREBASE_SERVICE_ACCOUNT: Please add the FIREBASE_SERVICE_ACCOUNT environment variable to your .env.local.'
    );
  }

  let certConfig;
  try {
    let cleanJson = serviceAccountJson.trim();
    if (cleanJson.startsWith("'") && cleanJson.endsWith("'")) {
      cleanJson = cleanJson.slice(1, -1).trim();
    } else if (cleanJson.startsWith('"') && cleanJson.endsWith('"')) {
      cleanJson = cleanJson.slice(1, -1).trim();
    }
    
    certConfig = JSON.parse(cleanJson);
    if (certConfig.private_key) {
      certConfig.private_key = certConfig.private_key.replace(/\\n/g, '\n');
    }
  } catch (error) {
    throw new Error(
      `INVALID_FIREBASE_SERVICE_ACCOUNT: Failed to parse FIREBASE_SERVICE_ACCOUNT. Details: ${error.message}`
    );
  }

  return initializeApp({
    credential: cert(certConfig),
  });
}

/**
 * Verifies the Firebase ID Token from the request authorization header
 * and validates that the email is whitelisted.
 */
export async function verifyAdminToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED: Missing or invalid Authorization header');
  }

  const idToken = authHeader.substring(7);

  // Initialize admin app
  const app = getAdminApp();
  const auth = getAuth(app);

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const email = decodedToken.email;
    
    // Google Auth accounts are verified, but let's check email_verified if present
    if (!email) {
      throw new Error('FORBIDDEN: Email claim is missing from ID token');
    }

    const whitelistedEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase());

    if (!whitelistedEmails.includes(email.toLowerCase())) {
      throw new Error(`FORBIDDEN: Email ${email} is not in the administrator whitelist`);
    }

    return { email, uid: decodedToken.uid };
  } catch (error) {
    console.error('Firebase Admin Verification Failed:', error.message);
    throw new Error(`UNAUTHORIZED: ${error.message}`);
  }
}

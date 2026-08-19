/**
 * Verifies the Firebase ID Token from the request authorization header
 * and validates that the email is whitelisted.
 * Uses Google's public tokeninfo verification endpoint to avoid service account key parsing errors.
 */
export async function verifyAdminToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED: Missing or invalid Authorization header');
  }

  const idToken = authHeader.substring(7);

  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'rajnish-f8c54';
    
    // Verify token using Google's tokeninfo API
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`);
    
    if (!verifyRes.ok) {
      const errText = await verifyRes.text();
      throw new Error(`Token verification failed: ${errText}`);
    }

    const payload = await verifyRes.json();
    
    // Validate audience matches our Firebase Project ID
    if (payload.aud !== projectId && payload.client_id !== projectId) {
      // Standard Firebase tokens have aud matching projectId, check fallback issuer as well
      const expectedIss = `https://securetoken.google.com/${projectId}`;
      if (payload.iss !== expectedIss) {
        throw new Error('FORBIDDEN: Audience/Issuer mismatch');
      }
    }

    const email = payload.email;
    if (!email) {
      throw new Error('FORBIDDEN: Email claim is missing from token');
    }

    // Default fallback to whitelisted emails if env variable not present in Vercel
    const whitelistedEmails = (process.env.ADMIN_EMAILS || 'abhi.kush047@gmail.com,kushwaharajnish2019@gmail.com')
      .split(',')
      .map(e => e.trim().toLowerCase());

    if (!whitelistedEmails.includes(email.toLowerCase())) {
      throw new Error(`FORBIDDEN: Email ${email} is not in the administrator whitelist`);
    }

    return { email, uid: payload.sub };
  } catch (error) {
    console.error('Admin Token Verification Failed:', error.message);
    throw new Error(`UNAUTHORIZED: ${error.message}`);
  }
}

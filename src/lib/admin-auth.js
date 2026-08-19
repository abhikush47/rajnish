/**
 * Verifies the Firebase ID Token from the request authorization header
 * and validates that the email is whitelisted.
 * Uses Firebase Auth REST API accounts:lookup to verify the token securely.
 */
export async function verifyAdminToken(req) {
  const authHeader = req.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('UNAUTHORIZED: Missing or invalid Authorization header');
  }

  const idToken = authHeader.substring(7);

  try {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyCL1XSkEwO20BebTLNH6AnXHJGPhAx6bVs';
    
    // Verify token using Firebase Auth REST API
    const verifyRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idToken })
    });
    
    if (!verifyRes.ok) {
      const errData = await verifyRes.json();
      const errMsg = errData?.error?.message || 'Token verification failed';
      throw new Error(`Firebase Auth API verification failed: ${errMsg}`);
    }

    const payload = await verifyRes.json();
    const user = payload?.users?.[0];
    
    if (!user) {
      throw new Error('FORBIDDEN: User info missing from token response');
    }

    const email = user.email;
    if (!email) {
      throw new Error('FORBIDDEN: Email claim is missing from token response');
    }

    // Default fallback to whitelisted emails if env variable not present in Vercel
    const whitelistedEmails = (process.env.ADMIN_EMAILS || 'abhi.kush047@gmail.com,kushwaharajnish2019@gmail.com')
      .split(',')
      .map(e => e.trim().toLowerCase());

    if (!whitelistedEmails.includes(email.toLowerCase())) {
      throw new Error(`FORBIDDEN: Email ${email} is not in the administrator whitelist`);
    }

    return { email, uid: user.localId };
  } catch (error) {
    console.error('Admin Token Verification Failed:', error.message);
    throw new Error(`UNAUTHORIZED: ${error.message}`);
  }
}

import { verifyAdminToken } from '@/lib/admin-auth';
import { getConnectRequests, getVolunteers, getFeedback, getSocialVideos } from '@/lib/db';

export async function GET(req) {
  try {
    // 1. Verify administrative access
    try {
      await verifyAdminToken(req);
    } catch (authError) {
      const isConfigError = authError.message.includes('MISSING_FIREBASE_SERVICE_ACCOUNT') || 
                            authError.message.includes('INVALID_FIREBASE_SERVICE_ACCOUNT');
      
      return Response.json(
        { 
          success: false, 
          error: authError.message,
          isConfigError
        }, 
        { status: isConfigError ? 500 : 401 }
      );
    }

    // 2. Fetch data
    const connectRequests = await getConnectRequests();
    const volunteers = await getVolunteers();
    const feedback = await getFeedback();
    const socialVideos = await getSocialVideos();

    return Response.json({
      success: true,
      connect_requests: connectRequests,
      volunteers,
      feedback,
      social_videos: socialVideos
    });
  } catch (error) {
    console.error('Error fetching admin data:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

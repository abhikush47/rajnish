import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken } from '@/lib/admin-auth';
import { 
  updateConnectRequestStatus, 
  updateVolunteerStatus, 
  updateFeedbackStatus,
  updateSocialVideo 
} from '@/lib/db';

export async function POST(req) {
  try {
    // 1. Verify administrative access
    try {
      await verifyAdminToken(req);
    } catch (authError) {
      const isConfigError = authError.message.includes('MISSING_FIREBASE_SERVICE_ACCOUNT') || 
                            authError.message.includes('INVALID_FIREBASE_SERVICE_ACCOUNT');
      return NextResponse.json(
        { success: false, error: authError.message, isConfigError }, 
        { status: isConfigError ? 500 : 401 }
      );
    }

    const { id, type, status } = await req.json();

    if (!id || !type || !status) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (id, type, status)' }, { status: 400 });
    }

    let updatedRecord;
    if (type === 'connect') {
      updatedRecord = await updateConnectRequestStatus(id, status);
    } else if (type === 'volunteer') {
      updatedRecord = await updateVolunteerStatus(id, status);
    } else if (type === 'feedback') {
      updatedRecord = await updateFeedbackStatus(id, status);
    } else if (type === 'social_video') {
      updatedRecord = await updateSocialVideo(id, { status });
      
      // Revalidate public routes when video status changes
      revalidatePath('/en/social-work');
      revalidatePath('/ne/social-work');
    } else {
      return NextResponse.json({ success: false, error: 'Invalid record type' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error) {
    console.error('Error updating record status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

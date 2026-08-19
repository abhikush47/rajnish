import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getYouthIdeas } from '@/lib/db';

export async function GET(req) {
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

    // 2. Fetch all ideas
    const ideas = await getYouthIdeas();

    return NextResponse.json({
      success: true,
      data: ideas
    });
  } catch (error) {
    console.error('Error fetching admin youth ideas:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

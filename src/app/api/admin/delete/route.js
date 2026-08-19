import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { deleteRecord } from '@/lib/db';

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

    const { id, type } = await req.json();

    if (!id || !type) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (id, type)' }, { status: 400 });
    }

    await deleteRecord(type, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

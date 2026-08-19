import { NextResponse } from 'next/server';
import { getYouthIdeaProgressUpdates } from '@/lib/db';

export async function GET(req, { params }) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing idea ID' }, { status: 400 });
    }

    const updates = await getYouthIdeaProgressUpdates(id);
    return NextResponse.json({
      success: true,
      data: updates
    });
  } catch (error) {
    console.error('Error fetching progress updates:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';

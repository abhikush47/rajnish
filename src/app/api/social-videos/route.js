import { NextResponse } from 'next/server';
import { getSocialVideos } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const videos = await getSocialVideos();
    // Return only published videos to public
    const publishedVideos = videos.filter(v => v.status === 'published');
    
    return NextResponse.json(publishedVideos, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0'
      }
    });
  } catch (error) {
    console.error('Error fetching social videos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

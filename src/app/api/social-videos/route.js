import { NextResponse } from 'next/server';
import { getSocialVideos } from '@/lib/db';

export async function GET() {
  try {
    const videos = await getSocialVideos();
    // Return only published videos to public
    const publishedVideos = videos.filter(v => v.status === 'published');
    return NextResponse.json(publishedVideos);
  } catch (error) {
    console.error('Error fetching social videos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

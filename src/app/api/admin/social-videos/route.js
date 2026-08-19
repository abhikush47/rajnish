import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getSocialVideos, addSocialVideo, updateSocialVideo } from '@/lib/db';

export async function GET(req) {
  try {
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

    const videos = await getSocialVideos();
    return NextResponse.json({ success: true, videos });
  } catch (error) {
    console.error('Error fetching admin social videos:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
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

    const entry = await req.json();
    const { id, title_en, description_en, title_ne, description_ne, video_url, platform, cover_image_url, status } = entry;

    if (!title_en || !description_en || !title_ne || !description_ne || !video_url) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (title, description, URL)' }, { status: 400 });
    }

    let result;
    if (id) {
      result = await updateSocialVideo(id, {
        title_en,
        description_en,
        title_ne,
        description_ne,
        video_url,
        platform: platform || 'other',
        cover_image_url: cover_image_url || '',
        status: status || 'draft'
      });
    } else {
      result = await addSocialVideo({
        title_en,
        description_en,
        title_ne,
        description_ne,
        video_url,
        platform: platform || 'other',
        cover_image_url: cover_image_url || '',
        status: status || 'draft'
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing admin social video:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

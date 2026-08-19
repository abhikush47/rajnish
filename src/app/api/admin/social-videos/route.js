import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { verifyAdminToken } from '@/lib/admin-auth';
import { getSocialVideos, addSocialVideo, updateSocialVideo } from '@/lib/db';

export async function GET(req) {
  try {
    // 1. Verify admin session
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
    // 1. Verify admin session
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
    const { id, title_en, description_en, title_ne, description_ne, video_url, platform, cover_image_url, cover_source, thumbnailStatus, status } = entry;

    if (id) {
      const updateData = {};
      if (title_en !== undefined) updateData.title_en = title_en;
      if (description_en !== undefined) updateData.description_en = description_en;
      if (title_ne !== undefined) updateData.title_ne = title_ne;
      if (description_ne !== undefined) updateData.description_ne = description_ne;
      if (video_url !== undefined) updateData.video_url = video_url;
      if (platform !== undefined) updateData.platform = platform;
      if (cover_image_url !== undefined) updateData.cover_image_url = cover_image_url;
      if (cover_source !== undefined) updateData.cover_source = cover_source;
      if (thumbnailStatus !== undefined) updateData.thumbnailStatus = thumbnailStatus;
      if (status !== undefined) updateData.status = status;

      const result = await updateSocialVideo(id, updateData);
      
      // Revalidate public routes
      revalidatePath('/en/social-work');
      revalidatePath('/ne/social-work');
      
      return NextResponse.json({ success: true, data: result });
    }

    // Creating new video requires all major fields
    if (!title_en || !description_en || !title_ne || !description_ne || !video_url) {
      return NextResponse.json({ success: false, error: 'Missing required parameters (title, description, URL)' }, { status: 400 });
    }

    const result = await addSocialVideo({
      title_en,
      description_en,
      title_ne,
      description_ne,
      video_url,
      platform: platform || 'other',
      cover_image_url: cover_image_url || '',
      cover_source: cover_source || 'auto',
      thumbnailStatus: thumbnailStatus || 'none',
      status: status || 'draft'
    });

    // Revalidate public routes
    revalidatePath('/en/social-work');
    revalidatePath('/ne/social-work');

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Error processing admin social video:', error);
    // Gracefully handle duplicate URLs
    if (error.message.includes('DUPLICATE_URL')) {
      return NextResponse.json({ success: false, error: 'This video URL has already been added.' }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    // Convert file to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert buffer to base64 Data URI for Cloudinary upload
    const base64Data = buffer.toString('base64');
    const fileUri = `data:${file.type || 'image/jpeg'};base64,${base64Data}`;

    // Upload to Cloudinary
    console.log('[Upload] Uploading manual cover image to Cloudinary...');
    const uploadRes = await cloudinary.uploader.upload(fileUri, {
      folder: 'social_covers',
      resource_type: 'image'
    });

    const fileUrl = uploadRes.secure_url;
    console.log('[Upload] Cloudinary upload successful:', fileUrl);

    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('Error handling manual Cloudinary upload:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const CRAWLER_UA = 'facebookexternalhit/1.1; facebot; Twitterbot/1.0; Discordbot/2.0';

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

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    const preview = await getPreviewMetadata(url);
    if (preview.thumbnailUrl) {
      return NextResponse.json({
        success: true,
        platform: preview.platform,
        thumbnailUrl: preview.thumbnailUrl,
        source: preview.source
      });
    } else {
      return NextResponse.json({
        success: false,
        platform: preview.platform,
        thumbnailUrl: null,
        error: 'No publicly accessible thumbnail was found'
      }, { status: 404 });
    }
  } catch (error) {
    console.error('Error in resolve-thumbnail API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function validateImage(url) {
  if (!url) return false;
  if (!url.startsWith('https://')) return false; // Verify HTTPS
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
    // Add Browser User-Agent header so CDN servers (like Facebook) do not block validation check with 403 Forbidden
    const res = await fetch(url, { 
      method: 'GET', 
      headers: { 'User-Agent': BROWSER_UA },
      signal: controller.signal, 
      cache: 'no-store' 
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return false;
    
    const contentType = res.headers.get('content-type') || '';
    if (contentType.startsWith('image/')) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

// Relaxed and robust HTML metadata extractor helper
function extractMetaTag(html, propertyName) {
  const regexes = [
    new RegExp(`<meta[^>]*(?:property|name)=["']${propertyName}["'][^>]*content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["']${propertyName}["']`, 'i')
  ];
  for (const regex of regexes) {
    const match = html.match(regex);
    if (match) return match[1];
  }
  return null;
}

async function getPreviewMetadata(url) {
  let platform = 'other';
  const cleanUrl = url.trim();

  if (/youtube\.com|youtu\.be/i.test(cleanUrl)) {
    platform = 'youtube';
  } else if (/vimeo\.com/i.test(cleanUrl)) {
    platform = 'vimeo';
  } else if (/facebook\.com/i.test(cleanUrl)) {
    platform = 'facebook';
  } else if (/instagram\.com/i.test(cleanUrl)) {
    platform = 'instagram';
  } else if (/tiktok\.com/i.test(cleanUrl)) {
    platform = 'tiktok';
  }

  const sources = [];

  // 1. YouTube platform extraction
  if (platform === 'youtube') {
    const videoId = extractYouTubeId(cleanUrl);
    if (videoId) {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
        const res = await fetch(oembedUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data.thumbnail_url) {
            sources.push({ url: data.thumbnail_url, source: 'youtube:oembed' });
          }
        }
      } catch (e) {}
      
      const qualities = [
        { q: 'maxresdefault', s: 'youtube:maxres' },
        { q: 'sddefault', s: 'youtube:sd' },
        { q: 'hqdefault', s: 'youtube:hq' },
        { q: 'default', s: 'youtube:default' }
      ];
      for (const item of qualities) {
        sources.push({ url: `https://img.youtube.com/vi/${videoId}/${item.q}.jpg`, source: item.s });
      }
    }
  }

  // 2. Vimeo platform extraction
  if (platform === 'vimeo') {
    try {
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(oembedUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail_url) {
          sources.push({ url: data.thumbnail_url, source: 'vimeo:oembed' });
        }
      }
    } catch (e) {}
  }

  // 3. TikTok platform extraction
  if (platform === 'tiktok') {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(oembedUrl, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail_url) {
          sources.push({ url: data.thumbnail_url, source: 'tiktok:oembed' });
        }
      }
    } catch (e) {}
  }

  // 4. HTML Open Graph / Twitter Card parsing
  // Try Browser User Agent first (very successful for Facebook Reels), then Crawler User Agent
  const userAgentsToTry = [BROWSER_UA, CRAWLER_UA];
  for (const ua of userAgentsToTry) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': ua,
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal,
        cache: 'no-store'
      });
      clearTimeout(id);

      if (response.ok) {
        const html = await response.text();
        
        const ogImage = extractMetaTag(html, 'og:image');
        if (ogImage) sources.push({ url: decodeHtmlEntities(ogImage), source: 'og:image' });

        const twitterImage = extractMetaTag(html, 'twitter:image');
        if (twitterImage) sources.push({ url: decodeHtmlEntities(twitterImage), source: 'twitter:image' });

        const secureImage = extractMetaTag(html, 'og:image:secure_url');
        if (secureImage) sources.push({ url: decodeHtmlEntities(secureImage), source: 'og:image:secure_url' });

        // If we succeeded in getting tags, break and proceed to validation
        if (ogImage || twitterImage || secureImage) {
          break;
        }
      }
    } catch (err) {
      console.error(`HTML parse failed with User-Agent: ${ua}`, err.message);
    }
  }

  // 5. Validate sources sequentially
  let resolvedUrl = '';
  let resolvedSource = 'none';

  for (const item of sources) {
    if (item.url) {
      const isValid = await validateImage(item.url);
      if (isValid) {
        resolvedUrl = item.url;
        resolvedSource = item.source;
        break;
      }
    }
  }

  // 6. Cloudinary persistent cache upload for transient external images
  if (resolvedUrl && platform !== 'youtube' && platform !== 'vimeo' && !resolvedUrl.includes('cloudinary.com')) {
    try {
      console.log('[Resolve] Downloading and caching transient cover image:', resolvedUrl);
      const imageRes = await fetch(resolvedUrl, {
        headers: { 'User-Agent': BROWSER_UA },
        cache: 'no-store'
      });
      if (imageRes.ok) {
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Data = buffer.toString('base64');
        const mimeType = imageRes.headers.get('content-type') || 'image/jpeg';
        const fileUri = `data:${mimeType};base64,${base64Data}`;
        
        const uploadRes = await cloudinary.uploader.upload(fileUri, {
          folder: 'social_covers',
          resource_type: 'image'
        });
        resolvedUrl = uploadRes.secure_url;
        console.log('[Resolve] Transient cover cached to Cloudinary:', resolvedUrl);
      }
    } catch (uploadErr) {
      console.warn('[Resolve] Cloudinary caching failed:', uploadErr.message);
    }
  }

  return {
    platform,
    thumbnailUrl: resolvedUrl || null,
    source: resolvedSource
  };
}

function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

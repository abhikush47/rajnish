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

// Server-side URL Normalizer helper
function normalizeUrl(value) {
  let url = value.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  return url;
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

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL is required' }, { status: 400 });
    }

    // Diagnostic logging
    console.log(`[Thumbnail Resolver] Request received`);
    console.log(`[Thumbnail Resolver] URL: ${url}`);

    // Normalize URL
    const normalizedUrl = normalizeUrl(url);
    
    // Validate URL
    let parsed;
    try {
      parsed = new URL(normalizedUrl);
    } catch (parseErr) {
      console.log(`[Thumbnail Resolver] URL Validation failed: Invalid URL structure`);
      return NextResponse.json({
        success: false,
        platform: 'other',
        thumbnailUrl: null,
        error: 'Invalid video URL structure'
      }, { status: 400 });
    }

    // Detect platform
    const platform = detectPlatform(normalizedUrl);
    console.log(`[Thumbnail Resolver] Platform: ${platform}`);
    console.log(`[Thumbnail Resolver] Resolving metadata...`);

    const { preview, sourcesAttempted } = await getPreviewMetadata(normalizedUrl, platform);
    
    if (preview.thumbnailUrl) {
      console.log(`[Thumbnail Resolver] Thumbnail: FOUND`);
      return NextResponse.json({
        success: true,
        platform: preview.platform,
        thumbnailUrl: preview.thumbnailUrl,
        source: preview.source
      });
    } else {
      console.log(`[Thumbnail Resolver] Thumbnail: NOT FOUND`);
      
      // Do NOT return 404 simply because a thumbnail could not be found. 
      // Return 200 OK with success: false to signal detection failure cleanly to the UI.
      const errorMsg = platform === 'facebook' 
        ? 'Facebook did not expose a publicly accessible thumbnail for this URL'
        : 'No publicly accessible thumbnail was found';

      return NextResponse.json({
        success: false,
        platform: preview.platform,
        thumbnailUrl: null,
        error: errorMsg,
        debug: {
          httpStatus: 200,
          platformDetected: platform,
          sourcesAttempted: sourcesAttempted
        }
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Error in resolve-thumbnail API:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

function detectPlatform(url) {
  if (/youtube\.com|youtu\.be/i.test(url)) {
    return 'youtube';
  } else if (/vimeo\.com/i.test(url)) {
    return 'vimeo';
  } else if (/facebook\.com/i.test(url)) {
    return 'facebook';
  } else if (/instagram\.com/i.test(url)) {
    return 'instagram';
  } else if (/tiktok\.com/i.test(url)) {
    return 'tiktok';
  }
  return 'other';
}

async function validateImage(url) {
  if (!url) return false;
  if (!url.startsWith('https://')) return false; // Verify HTTPS
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    
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

async function getPreviewMetadata(cleanUrl, platform) {
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

  // 4. Facebook plugins poster player fallback (runs first for Facebook to bypass 400 Bad Request / Redirect blocks)
  if (platform === 'facebook') {
    try {
      const fbPluginUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(cleanUrl)}`;
      console.log('[Resolve] Attempting Facebook plugin page poster fallback:', fbPluginUrl);
      const res = await fetch(fbPluginUrl, {
        headers: { 'User-Agent': BROWSER_UA },
        cache: 'no-store'
      });
      if (res.ok) {
        const html = await res.text();
        const regex = /https?:\\?\/\\?\/[^\s"']+\.fbcdn\.net\\?\/[^\s"']+\.(?:jpg|png|jpeg)[^\s"']*/gi;
        const matches = html.match(regex) || [];
        const urls = matches.map(u => u.replace(/\\/g, '').replace(/&amp;/g, '&'));
        const uniqueUrls = [...new Set(urls)];
        
        const coverCandidates = uniqueUrls.filter(url => {
          const lowerUrl = url.toLowerCase();
          return !lowerUrl.includes('/t39.') && !lowerUrl.includes('s40x40') && !lowerUrl.includes('s50x50') && !lowerUrl.includes('s100x100');
        });

        if (coverCandidates.length > 0) {
          sources.push({ url: coverCandidates[0], source: 'facebook:plugin' });
        } else if (uniqueUrls.length > 0) {
          sources.push({ url: uniqueUrls[0], source: 'facebook:plugin' });
        }
      }
    } catch (e) {
      console.error('[Resolve] Facebook plugin extraction error:', e.message);
    }
  }

  // 5. HTML Open Graph / Twitter Card parsing
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

        if (ogImage || twitterImage || secureImage) {
          break;
        }
      }
    } catch (err) {
      console.error(`HTML parse failed with User-Agent: ${ua}`, err.message);
    }
  }

  // 6. Validate sources sequentially
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

  // 7. Cloudinary persistent cache upload for transient external images
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
    sourcesAttempted: sources.map(s => ({ url: s.url, source: s.source })),
    preview: {
      platform,
      thumbnailUrl: resolvedUrl || null,
      source: resolvedSource
    }
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

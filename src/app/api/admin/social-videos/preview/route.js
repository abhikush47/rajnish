import { NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';

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
    return NextResponse.json({ success: true, preview });
  } catch (error) {
    console.error('Error generating video preview:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function validateImage(url) {
  if (!url) return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeoutId);
    if (res.ok) return true;
  } catch (e) {
    // Fallback to GET check
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(url, { method: 'GET', signal: controller.signal });
    clearTimeout(timeoutId);
    return res.ok;
  } catch (e) {
    return false;
  }
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

  let title = '';
  let description = '';
  let coverImageUrl = '';

  // 1. Platform-specific oEmbed/APIs first
  try {
    if (platform === 'youtube') {
      const videoId = extractYouTubeId(cleanUrl);
      if (videoId) {
        // Find best quality image that is valid
        const qualities = ['maxresdefault', 'sddefault', 'hqdefault', 'default'];
        for (const q of qualities) {
          const testUrl = `https://img.youtube.com/vi/${videoId}/${q}.jpg`;
          const isValid = await validateImage(testUrl);
          if (isValid) {
            coverImageUrl = testUrl;
            break;
          }
        }
        
        // Fetch oEmbed for title
        const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
        const res = await fetch(oembedUrl);
        if (res.ok) {
          const data = await res.json();
          title = data.title || '';
        }
      }
    } else if (platform === 'vimeo') {
      const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        description = data.description || '';
        coverImageUrl = data.thumbnail_url || '';
      }
    } else if (platform === 'tiktok') {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(oembedUrl);
      if (res.ok) {
        const data = await res.json();
        title = data.title || '';
        coverImageUrl = data.thumbnail_url || '';
      }
    }
  } catch (err) {
    console.error('oEmbed fetch failed:', err);
  }

  // 2. Fallback: Parse Open Graph metadata from page HTML using search-crawler User Agent
  if (!coverImageUrl || !title) {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000); // 4 seconds timeout
      
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'facebookexternalhit/1.1; facebot; Twitterbot/1.0; Discordbot/2.0',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal
      });
      clearTimeout(id);

      if (response.ok) {
        const html = await response.text();
        
        if (!title) {
          const titleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i) ||
                             html.match(/<title>(.*?)<\/title>/i);
          if (titleMatch) title = decodeHtmlEntities(titleMatch[1]);
        }

        if (!description) {
          const descMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                             html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
          if (descMatch) description = decodeHtmlEntities(descMatch[1]);
        }

        if (!coverImageUrl) {
          const imgMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                           html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
                           html.match(/<meta[^>]*property=["']og:image:secure_url["'][^>]*content=["']([^"']+)["']/i);
          if (imgMatch) coverImageUrl = decodeHtmlEntities(imgMatch[1]);
        }
      }
    } catch (err) {
      console.error('HTML parse / OG metadata fetch failed:', err);
    }
  }

  // 3. Final validation of resolved cover URL (if any was extracted from non-youtube)
  if (coverImageUrl && platform !== 'youtube') {
    const isImageValid = await validateImage(coverImageUrl);
    if (!isImageValid) {
      console.warn('[Preview] Resolved cover image URL failed validation:', coverImageUrl);
      coverImageUrl = '';
    }
  }

  return {
    platform,
    title,
    description,
    coverImageUrl
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

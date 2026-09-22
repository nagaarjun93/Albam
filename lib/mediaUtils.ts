export type VideoEmbedType = 'gdrive' | 'youtube' | 'direct' | 'local';

export interface VideoEmbedInfo {
  type: VideoEmbedType;
  embedUrl: string;
  originalUrl: string;
}

export function parseVideoUrl(url: string): VideoEmbedInfo {
  if (!url) {
    return { type: 'local', embedUrl: '', originalUrl: '' };
  }

  const cleanUrl = url.trim();

  // 1. Google Drive link
  // Handles:
  // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  // https://drive.google.com/open?id=FILE_ID
  // https://drive.google.com/file/d/FILE_ID/preview
  const gdriveIdMatch =
    cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

  if (gdriveIdMatch && gdriveIdMatch[1]) {
    const fileId = gdriveIdMatch[1];
    return {
      type: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      originalUrl: cleanUrl,
    };
  }

  // 2. YouTube link
  // Handles:
  // https://youtu.be/ID
  // https://www.youtube.com/watch?v=ID
  // https://www.youtube.com/shorts/ID
  // https://www.youtube.com/embed/ID
  const ytMatch = cleanUrl.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  );

  if (ytMatch && ytMatch[1]) {
    const ytId = ytMatch[1];
    return {
      type: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`,
      originalUrl: cleanUrl,
    };
  }

  // 3. Local media route
  if (cleanUrl.startsWith('/api/media/')) {
    return {
      type: 'local',
      embedUrl: cleanUrl,
      originalUrl: cleanUrl,
    };
  }

  // 4. Direct video URL (Cloudinary, Supabase, Dropbox, data URI, etc.)
  return {
    type: 'direct',
    embedUrl: cleanUrl,
    originalUrl: cleanUrl,
  };
}

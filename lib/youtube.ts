/**
 * Utility functions for YouTube video extraction and embedding
 */

/**
 * Extract YouTube Video ID from any YouTube URL, embed code, or raw ID
 */
export function getYouTubeVideoId(input: string | null | undefined): string | null {
  if (!input) return null;
  const str = input.trim();
  if (!str) return null;

  // 1. If it's an iframe embed code, extract the src URL
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  const target = iframeMatch ? iframeMatch[1] : str;

  // 2. Match standard youtube url patterns
  // Examples:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://www.youtube.com/live/VIDEO_ID
  const regExp =
    /(?:youtube(?:-nocookie)?\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = target.match(regExp);

  if (match && match[1]) {
    return match[1];
  }

  // 3. Fallback: If it's just a raw 11-char alphanumeric ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }

  return null;
}

/**
 * Get standard YouTube Embed URL
 */
export function getYouTubeEmbedUrl(input: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(input);
  if (!videoId) return null;
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/**
 * Get high-resolution YouTube Thumbnail URL
 */
export function getYouTubeThumbnailUrl(input: string | null | undefined): string | null {
  const videoId = getYouTubeVideoId(input);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

/**
 * Extract YouTube Video ID from HTML content (e.g. if embedded in body)
 */
export function extractYouTubeFromContent(content: string | null | undefined): string | null {
  if (!content) return null;
  const iframeMatch = content.match(
    /<iframe[^>]+src=["'](https?:\/\/(?:www\.)?youtube[^"']+)["']/i
  );
  if (iframeMatch) {
    return getYouTubeVideoId(iframeMatch[1]);
  }
  const linkMatch = content.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/[^\s<>"']+/i
  );
  if (linkMatch) {
    return getYouTubeVideoId(linkMatch[0]);
  }
  return null;
}

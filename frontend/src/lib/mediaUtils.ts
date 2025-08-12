// =====================================================
// Media Utilities for Google Drive and YouTube
// =====================================================

/**
 * Converts Google Drive sharing URL to direct image URL
 * Supports both old and new Google Drive URL formats
 */
export const getGoogleDriveImageUrl = (driveUrl: string): string => {
  if (!driveUrl) return '';
  
  try {
    // Remove any query parameters and get the file ID
    let fileId = '';
    
    // New Google Drive format: https://drive.google.com/file/d/{fileId}/view
    const newFormatMatch = driveUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (newFormatMatch) {
      fileId = newFormatMatch[1];
    } else {
      // Old Google Drive format: https://drive.google.com/open?id={fileId}
      const oldFormatMatch = driveUrl.match(/[?&]id=([a-zA-Z0-9-_]+)/);
      if (oldFormatMatch) {
        fileId = oldFormatMatch[1];
      }
    }
    
    if (fileId) {
      // Return direct image URL for Google Drive
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return driveUrl; // Return original URL if we can't parse it
  } catch (error) {
    console.error('Error parsing Google Drive URL:', error);
    return driveUrl;
  }
};

/**
 * Checks if a URL is a Google Drive image URL
 */
export const isGoogleDriveUrl = (url: string): boolean => {
  return url.includes('drive.google.com') && (url.includes('/file/') || url.includes('?id='));
};

/**
 * Checks if a URL is an IMG BB image URL
 */
export const isImgBbUrl = (url: string): boolean => {
  return url.includes('i.ibb.co') || url.includes('ibb.co');
};

/**
 * Extracts YouTube video ID from various YouTube URL formats
 */
export const getYouTubeVideoId = (youtubeUrl: string): string | null => {
  if (!youtubeUrl) return null;
  
  try {
    // YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9-_]{11})/,
      /youtube\.com\/watch\?.*v=([a-zA-Z0-9-_]{11})/,
      /youtu\.be\/([a-zA-Z0-9-_]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = youtubeUrl.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing YouTube URL:', error);
    return null;
  }
};

/**
 * Checks if a URL is a YouTube video URL
 */
export const isYouTubeUrl = (url: string): boolean => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

/**
 * Gets YouTube embed URL from video ID
 */
export const getYouTubeEmbedUrl = (videoId: string): string => {
  return `https://www.youtube.com/embed/${videoId}`;
};

/**
 * Determines the type of media from a URL
 */
export const getMediaType = (url: string): 'image' | 'video' | 'unknown' => {
  if (isYouTubeUrl(url)) {
    return 'video';
  }
  
  if (isGoogleDriveUrl(url) || isImgBbUrl(url) || url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
    return 'image';
  }
  
  return 'unknown';
};

/**
 * Validates if a URL is accessible (basic check)
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Formats media URLs for display
 */
export const formatMediaUrl = (url: string): string => {
  if (isGoogleDriveUrl(url)) {
    return getGoogleDriveImageUrl(url);
  }
  // IMG BB URLs are already in the correct format for direct image display
  return url;
};

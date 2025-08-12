# Media Features - Google Drive Images & YouTube Videos

This update adds support for Google Drive images and YouTube videos to enhance the project showcase experience.

## 🎯 New Features

### 1. Image Thumbnails (Google Drive & IMG BB)
- **Upload Form**: New field for Google Drive or IMG BB image links
- **Projects Page**: Uses custom images as thumbnails when available
- **Fallback**: Shows project name placeholder if no thumbnail or invalid link

### 2. Media Carousel
- **Project Detail Page**: Full carousel with images and videos
- **Multiple Media**: Support for multiple IMG BB images, Google Drive images, and YouTube videos
- **Navigation**: Arrow controls and thumbnail navigation
- **Media Type Indicators**: Shows whether current item is image or video

## 📋 Database Changes

### New Columns Added to Projects Table:
```sql
-- Thumbnail URL for Google Drive or IMG BB image
ALTER TABLE public.projects ADD COLUMN thumbnail_url text;

-- Media URLs array for carousel (JSON)
ALTER TABLE public.projects ADD COLUMN media_urls jsonb DEFAULT '[]'::jsonb;
```

## 🚀 Setup Instructions

### 1. Run Database Migration
Copy and paste this SQL into your Supabase SQL editor:

```sql
-- Add media support columns
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS thumbnail_url text;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;

-- Update the view to include new columns
DROP VIEW IF EXISTS public.projects_with_votes;
CREATE OR REPLACE VIEW public.projects_with_votes AS
SELECT
    p.id,
    p.user_id,
    p.title,
    p.vercel_url,
    p.description,
    p.thumbnail_url,
    p.media_urls,
    p.created_at,
    u.email as user_email,
    (SELECT count(*) FROM public.votes v WHERE v.project_id = p.id) as vote_count
FROM
    public.projects p
JOIN
    public.users u ON p.user_id = u.id;
```

### 2. Frontend Files Updated
- `frontend/src/lib/mediaUtils.ts` (new utility functions)
- `frontend/src/components/MediaCarousel.tsx` (new carousel component)
- `frontend/src/pages/UploadPage.tsx` (added media fields)
- `frontend/src/pages/ProjectsPage.tsx` (Google Drive thumbnails)
- `frontend/src/pages/ProjectDetailPage.tsx` (media carousel)
- `frontend/src/lib/supabase.ts` (updated Project type)

## 📸 How to Use

### IMG BB Images (Recommended)
1. **Go to https://imgbb.com/**
2. **Upload your image**
3. **Copy the direct link** (starts with `https://i.ibb.co/`)
4. **Paste the link in the thumbnail or media gallery field**
5. **The image will automatically render**

### Google Drive Images
1. **Upload an image to Google Drive**
2. **Right-click → Share → Copy link**
3. **Paste the link in the thumbnail field**
4. **The image will automatically render**

### YouTube Videos
1. **Copy the YouTube video URL**
2. **Paste it in the media gallery field**
3. **The video will embed in the carousel**

### Supported URL Formats

#### IMG BB:
- `https://i.ibb.co/{imageId}/{filename}.jpg`
- `https://ibb.co/{imageId}`

#### Google Drive:
- `https://drive.google.com/file/d/{fileId}/view`
- `https://drive.google.com/open?id={fileId}`

#### YouTube:
- `https://www.youtube.com/watch?v={videoId}`
- `https://youtu.be/{videoId}`
- `https://youtube.com/embed/{videoId}`

## 🎨 User Experience

### Upload Form
- **Thumbnail Field**: Optional Google Drive image link
- **Media Gallery**: Add multiple images/videos with + button
- **Remove Media**: Red "Remove" button for each media item
- **Validation**: Basic URL validation for all media links

### Projects Page
- **Smart Thumbnails**: Google Drive images take priority
- **Fallback**: Screenshot service if no custom thumbnail
- **Final Fallback**: Project name placeholder

### Project Detail Page
- **Media Carousel**: Full-screen carousel for multiple media
- **Navigation**: Arrow buttons and thumbnail strip
- **Media Indicators**: Shows image/video type
- **Slide Counter**: "1 of 3" display
- **Responsive**: Works on mobile and desktop

## 🔧 Technical Details

### Media Utilities (`mediaUtils.ts`)
- `getGoogleDriveImageUrl()`: Converts sharing URLs to direct image URLs
- `getYouTubeVideoId()`: Extracts video ID from various YouTube URL formats
- `getYouTubeEmbedUrl()`: Creates embed URLs for iframes
- `isGoogleDriveUrl()`: Detects Google Drive URLs
- `isYouTubeUrl()`: Detects YouTube URLs
- `getMediaType()`: Determines if URL is image or video

### Media Carousel Component
- **State Management**: Tracks current slide index
- **Smooth Transitions**: Framer Motion animations
- **Error Handling**: Fallback images for broken links
- **Accessibility**: Proper alt text and ARIA labels
- **Responsive Design**: Mobile-friendly controls

## 🧪 Testing Checklist

### Database
- [ ] Migration runs successfully
- [ ] New columns exist in projects table
- [ ] View includes new columns
- [ ] JSON array storage works for media_urls

### Upload Form
- [ ] Thumbnail field accepts Google Drive URLs
- [ ] Media gallery allows multiple URLs
- [ ] Add/remove media buttons work
- [ ] Form submission includes media data

### Projects Page
- [ ] Google Drive thumbnails display correctly
- [ ] Fallback to screenshot service works
- [ ] Final fallback shows project name

### Project Detail Page
- [ ] Media carousel displays with multiple items
- [ ] Navigation arrows work
- [ ] Thumbnail navigation works
- [ ] YouTube videos embed correctly
- [ ] Google Drive images display correctly
- [ ] Single media item works without carousel

### Error Handling
- [ ] Invalid URLs show fallback images
- [ ] Broken Google Drive links fallback gracefully
- [ ] Invalid YouTube URLs handled properly
- [ ] Empty media arrays don't break the UI

## 🎯 Future Enhancements

### Potential Features
- **Image Upload**: Direct file upload instead of just URLs
- **Video Upload**: Support for direct video files
- **Media Optimization**: Automatic image compression
- **Media Preview**: Thumbnail previews in upload form
- **Bulk Upload**: Drag & drop multiple files
- **Media Library**: Reusable media assets

### Technical Improvements
- **CDN Integration**: Better image delivery
- **Lazy Loading**: Optimize performance for many images
- **Progressive Loading**: Better loading states
- **Media Analytics**: Track media engagement
- **Caching**: Cache frequently accessed media

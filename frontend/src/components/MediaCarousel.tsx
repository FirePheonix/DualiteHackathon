import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Image as ImageIcon, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getGoogleDriveImageUrl, 
  isGoogleDriveUrl, 
  isImgBbUrl,
  getYouTubeVideoId, 
  getYouTubeEmbedUrl, 
  isYouTubeUrl,
  getMediaType 
} from '../lib/mediaUtils';

interface MediaCarouselProps {
  mediaUrls: string[];
  projectTitle: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ mediaUrls, projectTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Filter out empty URLs
  const validMediaUrls = mediaUrls?.filter(url => url.trim()) || [];
  
  if (validMediaUrls.length === 0) {
    return null;
  }

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === validMediaUrls.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? validMediaUrls.length - 1 : prevIndex - 1
    );
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const getMediaUrl = (url: string) => {
    if (isGoogleDriveUrl(url)) {
      return getGoogleDriveImageUrl(url);
    }
    // IMG BB URLs are already direct image URLs
    return url;
  };

  const getMediaType = (url: string) => {
    if (isYouTubeUrl(url)) {
      return 'video';
    }
    return 'image';
  };

  const currentUrl = validMediaUrls[currentIndex];
  const mediaType = getMediaType(currentUrl);
  const displayUrl = getMediaUrl(currentUrl);

  return (
    <div className="relative w-full">
      {/* Main Media Display */}
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-200 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            {mediaType === 'video' ? (
              <div className="w-full h-full">
                <iframe
                  src={getYouTubeEmbedUrl(getYouTubeVideoId(currentUrl)!)}
                  title={`${projectTitle} - Video ${currentIndex + 1}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <img
                src={displayUrl}
                alt={`${projectTitle} - Image ${currentIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://placehold.co/600x400/F0DFCB/020202?text=${encodeURIComponent(projectTitle)}`;
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Media Type Indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg flex items-center space-x-2">
          {mediaType === 'video' ? (
            <>
              <Video size={16} />
              <span className="font-poppins text-sm">Video</span>
            </>
          ) : (
            <>
              <ImageIcon size={16} />
              <span className="font-poppins text-sm">Image</span>
            </>
          )}
        </div>

        {/* Navigation Arrows */}
        {validMediaUrls.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {validMediaUrls.length > 1 && (
        <div className="mt-4">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {validMediaUrls.map((url, index) => {
              const mediaType = getMediaType(url);
              const displayUrl = getMediaUrl(url);
              
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === currentIndex 
                      ? 'border-dark-gray' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {mediaType === 'video' ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center relative">
                      <Play size={20} className="text-gray-600" />
                      <div className="absolute inset-0 bg-black/20"></div>
                    </div>
                  ) : (
                    <img
                      src={displayUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = `https://placehold.co/80x64/F0DFCB/020202?text=${index + 1}`;
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Slide Counter */}
      {validMediaUrls.length > 1 && (
        <div className="text-center mt-2">
          <span className="font-poppins text-sm text-gray-600">
            {currentIndex + 1} of {validMediaUrls.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default MediaCarousel;

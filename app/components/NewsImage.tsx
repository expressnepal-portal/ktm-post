'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface NewsImageProps {
  post: {
    id: string;
    title: string | null;
    featuredImage?: string | null;
    content: string | null;
    images?: string[];
  };
  className: string;
  fallbackGradient: string;
  isFeatured?: boolean;
  images?: string[]; // External images prop
}

// Function to extract ALL images from post content
function getAllImagesFromContent(content: string | null): string[] {
  if (!content) return [];
  
  const imagesSet = new Set<string>();
  
  // Match all img tags with src attribute
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1]) {
      imagesSet.add(match[1]);
    }
  }
  
  return Array.from(imagesSet);
}

// Function to get all available images for a post
function getAllPostImages(post: NewsImageProps['post'], externalImages: string[] = []): string[] {
  const allImages: string[] = [];
  
  // Helper to add without duplicates
  const addUniqueImage = (url: string) => {
    if (url && !allImages.includes(url)) {
      allImages.push(url);
    }
  };
  
  // Add featured image first if available
  if (post.featuredImage) {
    addUniqueImage(post.featuredImage);
  }
  
  // Add all images from content
  const contentImages = getAllImagesFromContent(post.content);
  contentImages.forEach(addUniqueImage);
  
  // Add images from post object
  if (post.images) {
    post.images.forEach(addUniqueImage);
  }
  
  // Add external images from props
  externalImages.forEach(addUniqueImage);
  
  return allImages;
}

export default function NewsImage({ 
  post, 
  className, 
  fallbackGradient, 
  isFeatured = false, 
  images = [] 
}: NewsImageProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Get all images when component mounts or dependencies change
  useEffect(() => {
    const imageList = getAllPostImages(post, images);
    setAllImages(imageList);
    setCurrentImageIndex(0);
    setImageError(false);
    setImageLoaded(false);
  }, [post, images]);

  // Preload next image for smoother transitions
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const nextIndex = (currentImageIndex + 1) % allImages.length;
    const nextImage = allImages[nextIndex];
    
    if (nextImage) {
      const img = new Image();
      img.src = nextImage;
    }
  }, [currentImageIndex, allImages]);

  // Set up interval to cycle through images
  useEffect(() => {
    if (allImages.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prevIndex => 
        (prevIndex + 1) % allImages.length
      );
      setImageLoaded(false);
    }, 4000);

    return () => clearInterval(interval);
  }, [allImages]);

  const handleImageError = useCallback(() => {
    // Try next image if available
    if (allImages.length > 1) {
      const nextIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(nextIndex);
      setImageError(false);
      setImageLoaded(false);
    } else {
      setImageError(true);
    }
  }, [allImages.length, currentImageIndex]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
    setImageLoaded(false);
    setImageError(false);
  }, []);

  const alt = post.title || "News Image";

  // Handle no images case
  if (allImages.length === 0) {
    return (
      <div className={`${className} ${fallbackGradient} flex items-center justify-center`}>
        <div className="text-center text-gray-600 p-4">
          <div className="text-3xl mb-2">📰</div>
          <div className="text-sm font-medium">KTM Post</div>
        </div>
      </div>
    );
  }

  // Handle image error
  if (imageError) {
    return (
      <div className={`${className} ${fallbackGradient} flex items-center justify-center`}>
        <div className="text-center text-gray-600 p-4">
          <div className="text-3xl mb-2">⚠️</div>
          <div className="text-sm font-medium">Image not available</div>
        </div>
      </div>
    );
  }

  const currentImage = allImages[currentImageIndex];

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main image container */}
      <div className={`w-full h-full ${!imageLoaded ? 'bg-gray-200 animate-pulse' : ''}`}>
        <img 
          src={currentImage} 
          alt={alt}
          className={`${className} w-full h-full transition-all duration-1000 ease-in-out object-cover`}
          loading="lazy"
          onError={handleImageError}
          onLoad={() => setImageLoaded(true)}
          style={{ 
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center center'
          }}
        />
      </div>
      
      {/* Image counter indicator */}
      {allImages.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium z-10">
          {currentImageIndex + 1} / {allImages.length}
        </div>
      )}
      
      {/* Enhanced gradient overlay - only for featured images */}
      {isFeatured && (
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent opacity-90"></div>
      )}
      
      {/* Navigation dots */}
      {allImages.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10 ">
          {allImages.map((img, index) => (
            <button
              key={`dot-${index}-${img.substring(0, 10)}`}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentImageIndex 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
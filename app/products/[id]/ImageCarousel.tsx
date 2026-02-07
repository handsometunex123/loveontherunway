"use client";

import { useState, useEffect } from "react";

interface ImageCarouselProps {
  images: Array<{ id: string; url: string }>;
  productName: string;
  autoPlayInterval?: number; // milliseconds
}

export default function ImageCarousel({ images, productName, autoPlayInterval = 5000 }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  if (images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
    setIsPaused(true); // Pause auto-play when user manually navigates
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true); // Pause auto-play when user manually selects
  };

  // Auto-play functionality
  useEffect(() => {
    if (images.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [currentIndex, isPaused, images.length, autoPlayInterval]);

  return (
    <div className="relative w-full mb-8">
      {/* Main Image */}
      <div 
        className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <img
          src={images[currentIndex].url}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-opacity duration-500"
        />
        
        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all"
              aria-label="Previous image"
            >
              ←
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-slate-900 rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-all"
              aria-label="Next image"
            >
              →
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-slate-900/75 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2">
            <span>{currentIndex + 1} / {images.length}</span>
            {!isPaused && (
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full animate-pulse" title="Auto-playing"></span>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goToIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex
                  ? "border-purple-600 opacity-100"
                  : "border-slate-200 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={image.url}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

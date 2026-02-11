"use client";

import { useState, useEffect } from "react";
import type { GalleryImage } from "@prisma/client";

type Props = {
  groupedImages: Record<string, GalleryImage[]>;
};

export default function GalleryClient({ groupedImages }: Props) {
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev" | null>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const eventNames = Object.keys(groupedImages);
  const currentImages = selectedEvent ? groupedImages[selectedEvent] : [];
  const currentImage = currentImages[currentIndex];

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEvent) return;
      if (e.key === "ArrowRight") {
        goToNext();
        setIsAutoPlay(false);
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
        setIsAutoPlay(false);
      } else if (e.key === "Escape") {
        closeGallery();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEvent, currentIndex, currentImages]);

  // Auto-play timer
  useEffect(() => {
    if (!isAutoPlay || !selectedEvent) return;
    const timer = setTimeout(() => {
      if (currentIndex < currentImages.length - 1) {
        setDirection("next");
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsAutoPlay(false);
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [isAutoPlay, currentIndex, currentImages.length, selectedEvent]);

  const openGallery = (eventName: string) => {
    setSelectedEvent(eventName);
    setCurrentIndex(0);
    setDirection(null);
    setIsAutoPlay(false);
  };

  const closeGallery = () => {
    setSelectedEvent(null);
    setCurrentIndex(0);
    setDirection(null);
    setIsAutoPlay(false);
  };

  const goToNext = () => {
    if (currentIndex < currentImages.length - 1) {
      setDirection("next");
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setDirection("prev");
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX;
    if (touchStart - touchEnd > 50) goToNext();
    else if (touchEnd - touchStart > 50) goToPrevious();
  };

  // Events showcase preview - Book-like layout
  return (
    <>
      {!selectedEvent ? (
        // Gallery Events Overview - Responsive
        <div className="space-y-8 md:space-y-12 lg:space-y-16">
          {eventNames.map((eventName, idx) => {
            const eventImages = groupedImages[eventName];
            const thumbnail = eventImages[0];

            return (
              <div key={eventName} className={`flex flex-col ${idx % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-6 md:gap-8`}>
                {/* Thumbnail */}
                <div
                  className="w-full md:flex-1 cursor-pointer group"
                  onClick={() => openGallery(eventName)}
                >
                  <div className="relative overflow-hidden rounded-2xl md:rounded-3xl shadow-lg md:shadow-2xl aspect-video group-hover:shadow-2xl md:group-hover:shadow-3xl transition-all duration-500">
                    {/* Book-like shadow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10"></div>

                    <img
                      src={thumbnail.url}
                      alt={eventName}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />

                    {/* Overlay with event info */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4 md:p-8">
                      <h3 className="text-white text-xl md:text-3xl font-black mb-1 md:mb-2">{eventName}</h3>
                      <div className="flex items-center gap-2 text-white/90 text-xs md:text-sm font-light">
                        <span className="inline-block w-2 h-2 bg-pink-500 rounded-full"></span>
                        <span>{eventImages.length} photos</span>
                      </div>
                    </div>

                    {/* Play button indicator */}
                    <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 md:p-6 group-hover:bg-white/40 transition-all duration-500">
                        <svg className="w-8 h-8 md:w-12 md:h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Event info - Right side */}
                <div className="w-full md:flex-1 text-center md:text-left">
                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-2 md:mb-4">{eventName}</h3>
                  <p className="text-slate-600 text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
                    Explore stunning moments from this unforgettable event.
                  </p>
                  <button
                    onClick={() => openGallery(eventName)}
                    className="inline-flex items-center gap-2 md:gap-3 px-6 md:px-8 py-3 md:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-sm md:text-base rounded-full hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <span>Flip Through</span>
                    <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Full-screen book-flip experience - Responsive
        <div
          className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-3 md:p-4 overflow-hidden"
          onClick={closeGallery}
        >
          {/* Close button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 md:top-8 right-4 md:right-8 z-20 text-white/70 hover:text-white transition-colors group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="relative w-7 h-7 md:w-10 md:h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </button>

          {/* Back button */}
          <button
            onClick={closeGallery}
            className="absolute top-4 md:top-8 left-4 md:left-8 z-20 text-white/70 hover:text-white transition-colors group flex items-center gap-2"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden md:inline text-sm font-semibold">Back</span>
          </button>

          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Desktop: Book pages (left/right sides) */}
            {!isMobile && (
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Left page */}
                <div className="w-1/2 h-full flex items-center justify-end pr-2">
                  {currentIndex > 0 && (
                    <div className="relative w-full h-full max-w-sm max-h-full rounded-2xl overflow-hidden shadow-2xl opacity-40">
                      <img
                        src={currentImages[currentIndex - 1].url}
                        alt="Previous"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Right page - Main image */}
                <div className="w-1/2 h-full flex items-center justify-start pl-2">
                  <div
                    className={`relative w-full h-full max-w-sm max-h-full rounded-2xl overflow-hidden shadow-2xl bg-white ${direction ? "page-flip-in" : ""} ${direction === "prev" ? "reverse" : ""}`}
                    key={currentImage.id}
                  >
                    <img
                      src={currentImage.url}
                      alt={currentImage.title || "Gallery image"}
                      className="w-full h-full object-cover"
                    />

                    {/* Image info overlay */}
                    {currentImage.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 md:p-6">
                        <p className="text-white font-bold text-base md:text-lg">{currentImage.title}</p>
                        <p className="text-white/70 text-xs font-light mt-1">{currentImage.eventName}</p>
                      </div>
                    )}

                    {/* Page curl effect */}
                    <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-white/20 to-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile: Single page view */}
            {isMobile && (
              <div className="relative w-full h-full flex items-center justify-center">
                <div
                  className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl bg-white ${direction ? "page-flip-in" : ""} ${direction === "prev" ? "reverse" : ""}`}
                  key={currentImage.id}
                >
                  <img
                    src={currentImage.url}
                    alt={currentImage.title || "Gallery image"}
                    className="w-full h-full object-cover"
                  />

                  {/* Image info overlay */}
                  {currentImage.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                      <p className="text-white font-bold text-sm">LORTW</p>
                      <p className="text-white/70 text-xs font-light mt-1">Love On The Runway 2026</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile navigation - Swipe hint */}
            {isMobile && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="group relative"
                  >
                    <div className="relative bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group-hover:scale-110 border border-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Counter */}
                <div className="text-white text-center flex items-center gap-1">
                  <div className="text-xl font-black">{currentIndex + 1}</div>
                  <div className="text-white/60 text-xs font-light">/ {currentImages.length}</div>
                </div>

                {currentIndex < currentImages.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="group relative"
                  >
                    <div className="relative bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group-hover:scale-110 border border-white/30">
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Desktop navigation - Bottom controls */}
            {!isMobile && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-8">
                {/* Previous button */}
                {currentIndex > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevious();
                    }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-4 transition-all duration-300 group-hover:scale-110 border border-white/30">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Counter */}
                <div className="text-white text-center">
                  <div className="text-3xl font-black">{currentIndex + 1}</div>
                  <div className="text-white/60 text-xs font-light">of {currentImages.length}</div>
                </div>

                {/* Next button */}
                {currentIndex < currentImages.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="group relative"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative bg-white/10 backdrop-blur-sm hover:bg-white/20 rounded-full p-4 transition-all duration-300 group-hover:scale-110 border border-white/30">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                )}

                {/* Auto-play button */}
                {currentIndex < currentImages.length - 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAutoPlay(!isAutoPlay);
                    }}
                    className={`group relative transition-all duration-300 ${isAutoPlay ? "opacity-100" : "opacity-60 hover:opacity-100"}`}
                  >
                    <div className={`absolute inset-0 rounded-full blur-lg ${isAutoPlay ? "bg-purple-500/40 opacity-100" : "bg-white/10 opacity-0 group-hover:opacity-100"} transition-all`}></div>
                    <div className={`relative rounded-full p-4 transition-all duration-300 group-hover:scale-110 border ${isAutoPlay ? "bg-purple-500/30 border-purple-400/50" : "bg-white/10 border-white/30"}`}>
                      <svg className={`w-5 h-5 ${isAutoPlay ? "text-purple-300" : "text-white"}`} fill="currentColor" viewBox="0 0 24 24">
                        {isAutoPlay ? (
                          <>
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                          </>
                        ) : (
                          <path d="M8 5v14l11-7z" />
                        )}
                      </svg>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Keyboard hint - Desktop only */}
            {!isMobile && (
              <div className="absolute top-8 flex flex-wrap items-center gap-4 text-white/50 text-xs font-light justify-center px-4">
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded bg-white/10 font-mono text-xs">←</span>
                  <span className="px-2 py-1 rounded bg-white/10 font-mono text-xs">→</span>
                  <span>to navigate</span>
                </div>
                <span className="text-white/30">•</span>
                <div className="flex items-center gap-1">
                  <span className="px-2 py-1 rounded bg-white/10 font-mono text-xs">ESC</span>
                  <span>to close</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

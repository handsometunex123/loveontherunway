"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface DesignerProductCarouselProps {
  designerId: string;
  products: Array<{
    id: string;
    name: string;
    images: Array<{ id: string; url: string }>;
  }>;
}

export default function DesignerProductCarousel({
  designerId,
  products
}: DesignerProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const carouselWrapperRef = useRef<HTMLDivElement>(null);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);

  const cardWidth = 192; // w-48
  const gap = 20; // gap-5

  // Intersection Observer to detect when carousel is in viewport
  useEffect(() => {
    const wrapper = carouselWrapperRef.current;
    if (!wrapper) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsInViewport(entry.isIntersecting);
        });
      },
      { threshold: 0.3 } // Start when 30% visible
    );

    observer.observe(wrapper);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Track scroll position to update dot indicators
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const containerWidth = container.clientWidth;
      const scrollWidth = container.scrollWidth;
      
      // Calculate index based on scroll position
      let index = Math.round(scrollLeft / (cardWidth + gap));
      
      // Handle last item edge case
      if (scrollLeft + containerWidth >= scrollWidth - 5) {
        index = products.length - 1;
      }
      
      const clampedIndex = Math.max(0, Math.min(index, products.length - 1));
      setCurrentIndex(clampedIndex);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [products.length]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isInViewport || isHovering || products.length === 0) {
      // Clear interval if not in viewport or hovering
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const nextIndex = (currentIndex + 1) % products.length;
        const scrollPosition = nextIndex * (cardWidth + gap);
        
        container.scrollTo({
          left: scrollPosition,
          behavior: "smooth"
        });
        
        setCurrentIndex(nextIndex);
      }, 3000);
    };

    // Start after 2 second delay
    const startTimeout = setTimeout(startAutoScroll, 2000);

    return () => {
      clearTimeout(startTimeout);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [currentIndex, isHovering, products.length, isInViewport]);

  if (!products.length) {
    return (
      <div className="rounded-2xl bg-slate-100 p-8 text-center border border-slate-200">
        <p className="text-sm text-slate-500 font-semibold">No designs available yet</p>
      </div>
    );
  }

  return (
    <div className="w-full" ref={carouselWrapperRef}>
      {/* Carousel Section */}
      <div className="relative">
        {/* Main Carousel Track */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-5 overflow-x-auto scroll-smooth hide-scrollbar py-2"
        >
          {products.map((product, idx) => (
            <Link
              key={`${product.id}-${idx}`}
              href={`/products/${product.id}`}
              className="group/card flex-shrink-0 w-48"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Product Card */}
              <div className="h-full rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col">
                
                {/* Image Container */}
                <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                  {product.images[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover/card:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400 text-sm">
                      No image
                    </div>
                  )}
                </div>

                {/* Product Info Section */}
                <div className="p-4 bg-white">
                  <p className="text-sm font-bold text-slate-900 line-clamp-2 group-hover/card:text-purple-600 transition-colors duration-300">
                    {product.name}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Dot Indicators (Non-clickable) */}
      <div className="mt-6 flex justify-center gap-2">
        {products.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex
                ? "w-8 bg-purple-600"
                : "w-2 bg-slate-300"
            }`}
            aria-label={`Product ${idx + 1}`}
          />
        ))}
      </div>

      {/* Status Text */}
      <p className="text-xs text-slate-500 font-medium text-center mt-3">
        {currentIndex + 1} of {products.length} designs
      </p>

      {/* Styles */}
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
      `}</style>
    </div>
  );
}
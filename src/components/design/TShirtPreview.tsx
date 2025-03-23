"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface TShirtPreviewProps {
  color: {
    name: string;
    value: string;
    image: string;
  };
  designImage: string | null;
  side: 'front' | 'back';
}

export default function TShirtPreview({ color, designImage, side }: TShirtPreviewProps) {
  // State for design loading
  const [isDesignLoading, setIsDesignLoading] = useState(false);
  const [designError, setDesignError] = useState(false);

  // Reset loading state when design image changes
  useEffect(() => {
    if (designImage) {
      setIsDesignLoading(true);
      setDesignError(false);
    }
  }, [designImage]);

  // Define the position and size of the design for front and back
  const designPosition = {
    front: {
      top: '25%',
      left: '50%',
      transform: 'translate(-50%, -25%)',
      width: '40%',
      height: '40%',
    },
    back: {
      top: '30%',
      left: '50%',
      transform: 'translate(-50%, -30%)',
      width: '45%',
      height: '40%',
    },
  };

  // Handle image load event
  const handleDesignLoad = () => {
    setIsDesignLoading(false);
  };

  // Handle image error event
  const handleDesignError = () => {
    setIsDesignLoading(false);
    setDesignError(true);
  };

  return (
    <div className="relative w-full aspect-[3/4]">
      {/* T-shirt image */}
      <div className="relative w-full h-full">
        <Image
          src={color.image}
          alt={`${color.name} t-shirt ${side}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          style={{ objectFit: 'contain' }}
        />
      </div>

      {/* Design overlay - realistic placement */}
      {designImage && (
        <div 
          className={`absolute overflow-hidden ${isDesignLoading ? 'animate-pulse bg-gray-200' : ''}`}
          style={{
            position: 'absolute',
            ...designPosition[side],
            borderRadius: '4px',
            // Remove borders when design is loaded for more realistic preview
            border: isDesignLoading || designError ? '2px dashed #60a5fa' : 'none',
            // Blend mode for more realistic appearance on colored shirts
            mixBlendMode: 'multiply',
            // Perspective transformation for realistic placement
            perspective: '500px',
            transformStyle: 'preserve-3d',
            // Slight rotation to match t-shirt contour
            transform: `${designPosition[side].transform} rotateX(5deg) rotateY(${side === 'front' ? '0deg' : '0deg'})`,
          }}
        >
          <div className="relative w-full h-full">
            {!designError && (
              <Image
                src={designImage}
                alt="Your custom design"
                fill
                sizes="(max-width: 768px) 40vw, 20vw"
                style={{ 
                  objectFit: 'contain',
                  opacity: isDesignLoading ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out',
                }}
                onLoad={handleDesignLoad}
                onError={handleDesignError}
              />
            )}
            
            {/* Error message if design fails to load */}
            {designError && (
              <div className="w-full h-full flex items-center justify-center bg-red-50 bg-opacity-70 p-2">
                <p className="text-center text-red-600 text-xs">Failed to load design</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Design placement indicator when no design */}
      {!designImage && (
        <div 
          className="absolute border-2 border-dashed border-blue-400 rounded-md flex items-center justify-center bg-white bg-opacity-30"
          style={{
            position: 'absolute',
            ...designPosition[side],
          }}
        >
          <p className="text-center text-gray-600 text-sm px-2">Design will appear here</p>
        </div>
      )}

      {/* Optional controls for adjusting design size/position */}
      {designImage && !isDesignLoading && !designError && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
          <button className="bg-white bg-opacity-70 p-1 rounded text-xs hover:bg-opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="bg-white bg-opacity-70 p-1 rounded text-xs hover:bg-opacity-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
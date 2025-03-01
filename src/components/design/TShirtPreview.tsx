"use client";

import React from 'react';
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

      {/* Design overlay */}
      {designImage && (
        <div 
          className="absolute border-2 border-dashed border-blue-400 bg-white bg-opacity-60 rounded-md overflow-hidden"
          style={{
            position: 'absolute',
            ...designPosition[side],
          }}
        >
          <div className="relative w-full h-full">
            <Image
              src={designImage}
              alt="Your custom design"
              fill
              sizes="(max-width: 768px) 40vw, 20vw"
              style={{ objectFit: 'contain' }}
            />
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
    </div>
  );
}
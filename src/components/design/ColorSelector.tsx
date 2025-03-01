"use client";

import React from 'react';
import Image from 'next/image';

interface Color {
  name: string;
  value: string;
  image: string;
}

interface ColorSelectorProps {
  colors: Color[];
  selectedColor: Color;
  onColorSelect: (color: Color) => void;
}

export default function ColorSelector({ colors, selectedColor, onColorSelect }: ColorSelectorProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {colors.map((color) => (
        <div 
          key={color.value}
          onClick={() => onColorSelect(color)}
          className={`
            relative cursor-pointer border-2 rounded-md overflow-hidden
            ${selectedColor.value === color.value ? 'border-blue-500' : 'border-gray-200'}
            transition-all hover:shadow-lg
          `}
          style={{ width: '80px', height: '80px' }}
        >
          <div className="absolute inset-0">
            <Image
              src={color.image}
              alt={color.name}
              fill
              sizes="80px"
              style={{ objectFit: 'cover' }}
            />
          </div>
          <div className={`
            absolute inset-0 flex items-center justify-center bg-black bg-opacity-40
            ${selectedColor.value === color.value ? 'opacity-100' : 'opacity-0'}
            transition-opacity hover:opacity-100
          `}>
            <span className="text-white font-medium">{color.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
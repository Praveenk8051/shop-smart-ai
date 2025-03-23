"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import PromptInput, { DesignOptions } from './PromptInput';
import ColorSelector from './ColorSelector';
import TShirtPreview from './TShirtPreview';
import { generateDesign, formatDesignPrompt } from '@/lib/api/openai';

// T-shirt colors available
const COLORS = [
  { name: 'Black', value: 'black', image: '/images/black.JPG' },
  { name: 'Red', value: 'red', image: '/images/red.jpeg' },
  { name: 'Blue', value: 'blue', image: '/images/bblue.jpeg' },
];

export default function TShirtDesigner() {
  // State variables
  const [prompt, setPrompt] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [side, setSide] = useState<'front' | 'back'>('front');
  const [designImage, setDesignImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  // Handler for generating the design
  const handleGenerateDesign = async (options: DesignOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      // Format the full prompt from options
      const formattedPrompt = formatDesignPrompt(options);
      setGeneratedPrompt(formattedPrompt);
      
      // Call the API to generate the design
      const imageUrl = await generateDesign(formattedPrompt);
      setDesignImage(imageUrl);
    } catch (err) {
      console.error('Error generating design:', err);
      setError('Failed to generate design. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handler for switching sides (front/back)
  const handleSideChange = (newSide: 'front' | 'back') => {
    setSide(newSide);
  };

  // Handler for color selection
  const handleColorChange = (color: typeof COLORS[0]) => {
    setSelectedColor(color);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - T-shirt Preview */}
      <div className="flex flex-col items-center">
        <div className="mb-4">
          <button
            onClick={() => handleSideChange('front')}
            className={`px-4 py-2 mr-2 rounded-md ${
              side === 'front' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Front
          </button>
          <button
            onClick={() => handleSideChange('back')}
            className={`px-4 py-2 rounded-md ${
              side === 'back' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Back
          </button>
        </div>
        
        <div className="relative w-full max-w-md">
          <TShirtPreview 
            color={selectedColor} 
            designImage={designImage} 
            side={side} 
          />
        </div>
        
        {/* Generated Prompt Display (collapsible) */}
        {generatedPrompt && (
          <div className="mt-4 w-full">
            <details className="border rounded p-2 text-sm">
              <summary className="font-medium cursor-pointer">View Generated Prompt</summary>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">{generatedPrompt}</p>
            </details>
          </div>
        )}
      </div>
      
      {/* Right Column - Controls */}
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Design Options</h2>
        
        {/* Prompt Input */}
        <PromptInput
          prompt={prompt}
          setPrompt={setPrompt}
          onGenerate={handleGenerateDesign}
          loading={loading}
        />
        
        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {/* Color Selector */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Choose T-Shirt Color</h3>
          <ColorSelector 
            colors={COLORS} 
            selectedColor={selectedColor} 
            onColorSelect={handleColorChange} 
          />
        </div>
        
        {/* Add to Cart Button */}
        <button
          className="mt-8 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full"
          disabled={!designImage || loading}
        >
          Add to Cart
        </button>
        
        {/* Save Design Button */}
        <button
          className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full"
          disabled={!designImage || loading}
        >
          Save Design
        </button>
      </div>
    </div>
  );
}
"use client";

import React, { useState } from 'react';

export interface DesignOptions {
  subject: string;
  style: string;
  colorScheme: string;
  elements: string;
  background: string;
}

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: (options: DesignOptions) => void;
  loading: boolean;
}

// Default values
const DEFAULT_OPTIONS: DesignOptions = {
  subject: 'abstract geometric pattern',
  style: 'minimalist',
  colorScheme: 'monochromatic black and white',
  elements: 'shapes and lines',
  background: 'transparent',
};

// Examples for help text
const EXAMPLES = {
  subject: 'mountain landscape, cosmic astronaut, vintage car, abstract animal',
  style: 'watercolor, digital art, vintage poster, line art, graffiti',
  colorScheme: 'neon pink and blue, earth tones, pastel colors, monochromatic',
  elements: 'geometric shapes, floral patterns, typography, borders',
  background: 'transparent, gradient blue, solid black, textured',
};

export default function PromptInput({ prompt, setPrompt, onGenerate, loading }: PromptInputProps) {
  // State for design options
  const [designOptions, setDesignOptions] = useState<DesignOptions>(DEFAULT_OPTIONS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Update individual option
  const updateOption = (field: keyof DesignOptions, value: string) => {
    setDesignOptions(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If using a custom prompt, pass it along with empty options
    if (prompt.trim() && !showAdvanced) {
      onGenerate({
        ...DEFAULT_OPTIONS,
        subject: prompt, // Use the prompt as the subject if not using advanced options
      });
    } else {
      // Otherwise use the advanced options
      onGenerate(designOptions);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* Custom Prompt Input (Simple Mode) */}
      {!showAdvanced && (
        <>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-1">
            Design Prompt
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="text"
              name="prompt"
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="flex-1 min-w-0 block w-full px-3 py-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., A cosmic astronaut riding a unicorn through space with neon colors"
              disabled={loading}
            />
            <button
              type="submit"
              className="inline-flex items-center px-4 py-3 border border-transparent text-sm font-medium rounded-r-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading || (!prompt.trim() && !showAdvanced)}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate'
              )}
            </button>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Enter a design idea or <button 
              type="button" 
              onClick={() => setShowAdvanced(true)}
              className="text-blue-600 underline focus:outline-none"
            >
              use advanced options
            </button>
          </p>
        </>
      )}

      {/* Advanced Design Options */}
      {showAdvanced && (
        <div className="space-y-4 mt-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-800">Advanced Design Options</h3>
            <button 
              type="button" 
              onClick={() => setShowAdvanced(false)}
              className="text-sm text-blue-600 underline focus:outline-none"
            >
              Use simple prompt
            </button>
          </div>
          
          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="subject"
                value={designOptions.subject}
                onChange={(e) => updateOption('subject', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={DEFAULT_OPTIONS.subject}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Examples: {EXAMPLES.subject}</p>
            </div>
          </div>
          
          {/* Style */}
          <div>
            <label htmlFor="style" className="block text-sm font-medium text-gray-700">
              Style
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="style"
                value={designOptions.style}
                onChange={(e) => updateOption('style', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={DEFAULT_OPTIONS.style}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Examples: {EXAMPLES.style}</p>
            </div>
          </div>
          
          {/* Color Scheme */}
          <div>
            <label htmlFor="colorScheme" className="block text-sm font-medium text-gray-700">
              Color Scheme
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="colorScheme"
                value={designOptions.colorScheme}
                onChange={(e) => updateOption('colorScheme', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={DEFAULT_OPTIONS.colorScheme}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Examples: {EXAMPLES.colorScheme}</p>
            </div>
          </div>
          
          {/* Elements */}
          <div>
            <label htmlFor="elements" className="block text-sm font-medium text-gray-700">
              Elements
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="elements"
                value={designOptions.elements}
                onChange={(e) => updateOption('elements', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={DEFAULT_OPTIONS.elements}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Examples: {EXAMPLES.elements}</p>
            </div>
          </div>
          
          {/* Background */}
          <div>
            <label htmlFor="background" className="block text-sm font-medium text-gray-700">
              Background
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="background"
                value={designOptions.background}
                onChange={(e) => updateOption('background', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={DEFAULT_OPTIONS.background}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">Examples: {EXAMPLES.background}</p>
            </div>
          </div>
          
          {/* Generate Button */}
          <button
            type="submit"
            className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={loading || (!designOptions.subject.trim())}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Design'
            )}
          </button>
        </div>
      )}
    </form>
  );
}
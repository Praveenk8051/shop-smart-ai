"use client";

import React from 'react';

interface PromptInputProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  onGenerate: () => void;
  loading: boolean;
}

export default function PromptInput({ prompt, setPrompt, onGenerate, loading }: PromptInputProps) {
  // Handler for form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
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
          disabled={loading || !prompt.trim()}
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
        Be specific about colors, style, and details you want in your design.
      </p>
    </form>
  );
}
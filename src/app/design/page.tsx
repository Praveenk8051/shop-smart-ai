"use client";

import React from 'react';
import TShirtDesigner from '@/components/design/TShirtDesigner';

export default function DesignPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Create Your Custom T-Shirt Design</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="mb-6 text-gray-600">
          Use AI to generate unique designs for your custom t-shirt. Enter a text prompt describing what you want, 
          choose colors, and see your design come to life!
        </p>
        
        <TShirtDesigner />
      </div>
    </div>
  );
}
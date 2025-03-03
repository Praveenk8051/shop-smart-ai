"use client";

import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthContext';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Create Your Own AI-Generated T-Shirt Design</h1>
        <p className="text-xl mb-8">Unique designs created just for you, powered by AI</p>
        
        {isLoading ? (
          <button 
            disabled
            className="bg-gray-400 text-white px-8 py-3 rounded-lg text-lg font-semibold cursor-wait"
          >
            Loading...
          </button>
        ) : isAuthenticated ? (
          <Link href="/design">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Designing
            </button>
          </Link>
        ) : (
          <Link href="/auth">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Login to Start Designing
            </button>
          </Link>
        )}
      </section>

      <section className="py-12">
        <h2 className="text-3xl font-bold text-center mb-8">Featured Designs</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((item) => (
            <div key={item} className="border rounded-lg overflow-hidden shadow-md">
              <div className="bg-gray-200 h-64 flex items-center justify-center">
                <span className="text-gray-500">T-Shirt Image {item}</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg">AI Design #{item}</h3>
                <p className="text-gray-600 mb-2">Unique abstract pattern with vibrant colors</p>
                <p className="font-bold text-lg">$29.99</p>
                <button 
                  onClick={() => !isAuthenticated && (window.location.href = '/auth')}
                  className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {isAuthenticated ? 'Add to Cart' : 'Login to Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
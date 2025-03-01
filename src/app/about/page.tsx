import React from 'react';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
        <p className="mb-4">
          At AI T-Shirt Designer, we're on a mission to revolutionize the way people express themselves through custom apparel. 
          By combining cutting-edge AI technology with intuitive design tools, we empower everyone to create unique, high-quality 
          t-shirts that reflect their personality, passions, and creativity.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Story</h2>
        <p className="mb-4">
          Founded in 2023, AI T-Shirt Designer began as a collaboration between fashion designers and AI engineers who 
          shared a vision: to make custom apparel design accessible to everyone, regardless of artistic ability or technical expertise.
        </p>
        <p className="mb-4">
          What started as an experimental project quickly evolved into a platform that bridges the gap between technology and 
          creative expression, allowing users to bring their ideas to life with just a few clicks.
        </p>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Our Values</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>Innovation:</strong> We constantly push the boundaries of what's possible in AI-assisted design.</li>
          <li><strong>Quality:</strong> We're committed to delivering premium products that our customers are proud to wear.</li>
          <li><strong>Sustainability:</strong> We prioritize eco-friendly materials and responsible manufacturing practices.</li>
          <li><strong>Community:</strong> We celebrate creativity and foster a supportive community of designers.</li>
          <li><strong>Accessibility:</strong> We make custom design available to everyone, regardless of design experience.</li>
        </ul>
        
        <h2 className="text-2xl font-semibold mb-4 mt-8">Meet Our Team</h2>
        <p className="mb-4">
          Our diverse team brings together expertise from fashion design, software engineering, artificial intelligence, 
          and customer experience. United by our passion for creativity and innovation, we work together to deliver the 
          best possible platform for our users.
        </p>
      </div>
    </div>
  );
}
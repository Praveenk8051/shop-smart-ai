import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Get in Touch</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Customer Support</h3>
            <p className="mb-1"><strong>Email:</strong> support@aitshirtdesigner.com</p>
            <p className="mb-1"><strong>Phone:</strong> (555) 123-4567</p>
            <p className="mb-1"><strong>Hours:</strong> Monday-Friday, 9am-5pm EST</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Business Inquiries</h3>
            <p className="mb-1"><strong>Email:</strong> partnerships@aitshirtdesigner.com</p>
            <p className="mb-1"><strong>Phone:</strong> (555) 987-6543</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Headquarters</h3>
            <p className="mb-1">123 Design Street</p>
            <p className="mb-1">Suite 456</p>
            <p className="mb-1">New York, NY 10001</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold mb-4">Send Us a Message</h2>
          
          <form className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                id="subject"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Order inquiry"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                id="message"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="How can we help you?"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
      
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">How long does shipping take?</h3>
            <p className="text-gray-600">Standard shipping takes 3-5 business days. Express shipping is available for 1-2 business day delivery.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">Can I return my order?</h3>
            <p className="text-gray-600">Yes, we offer a 30-day return policy for unused items in original packaging. Custom designs cannot be returned.</p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium">How do I track my order?</h3>
            <p className="text-gray-600">You'll receive a tracking number via email once your order ships. You can also check your order status in your account.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Help() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Help & FAQs</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="border rounded-lg p-6 bg-white text-center hover:shadow-md transition-shadow">
          <div className="mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Chat Support</h2>
          <p className="text-gray-600 mb-4">Get instant help from our customer support team</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Start Chat
          </button>
        </div>
        
        <div className="border rounded-lg p-6 bg-white text-center hover:shadow-md transition-shadow">
          <div className="mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Email Support</h2>
          <p className="text-gray-600 mb-4">Send us an email and we'll respond within 24 hours</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Email Us
          </button>
        </div>
        
        <div className="border rounded-lg p-6 bg-white text-center hover:shadow-md transition-shadow">
          <div className="mb-4 text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Phone Support</h2>
          <p className="text-gray-600 mb-4">Call us directly at (555) 123-4567</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
            Call Now
          </button>
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            {
              question: 'How does the AI t-shirt design process work?',
              answer: 'Our AI technology analyzes your preferences and generates unique designs based on your input. You can provide prompts, choose styles, and customize colors to create a one-of-a-kind t-shirt design tailored to your taste.'
            },
            {
              question: 'What is the quality of the t-shirts?',
              answer: 'We use premium 100% cotton t-shirts that are pre-shrunk and extremely comfortable. Our printing process ensures vibrant, long-lasting designs that won\'t fade or crack after washing.'
            },
            {
              question: 'How long does shipping take?',
              answer: 'Standard shipping typically takes 5-7 business days within the continental US. Express shipping options are available at checkout for faster delivery. International shipping may take 10-14 business days depending on the destination.'
            },
            {
              question: 'Can I return or exchange my order?',
              answer: 'Yes, we offer a 30-day return policy for unworn items in original packaging. Custom designed t-shirts cannot be returned unless there is a manufacturing defect. Please contact our customer service team to initiate a return or exchange.'
            },
            {
              question: 'How do I track my order?',
              answer: 'Once your order ships, you\'ll receive a confirmation email with tracking information. You can also track your order by logging into your account and visiting the Orders section.'
            }
          ].map((faq, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 p-4 font-medium">
                {faq.question}
              </div>
              <div className="p-4 bg-white">
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">Still have questions?</h2>
        <p className="text-gray-700 mb-4">Our support team is always here to help you with any questions or concerns.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Contact Us
        </button>
      </div>
    </div>
  );
}
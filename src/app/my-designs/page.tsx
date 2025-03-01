export default function MyDesigns() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Designs</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
          Create New Design
        </button>
      </div>
      
      <div className="mb-8">
        <ul className="flex border-b">
          <li className="mr-1">
            <button className="bg-white inline-block py-2 px-4 font-semibold border-l border-t border-r rounded-t border-blue-500 text-blue-500">
              Saved Designs (4)
            </button>
          </li>
          <li className="mr-1">
            <button className="bg-white inline-block py-2 px-4 text-gray-600 hover:text-blue-500">
              Purchased Designs (2)
            </button>
          </li>
        </ul>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="border rounded-lg overflow-hidden shadow-md">
            <div className="bg-gray-200 h-64 flex items-center justify-center">
              <span className="text-gray-500">T-Shirt Design {item}</span>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-lg">My Creation #{item}</h3>
              <p className="text-gray-600 mb-2">Created on {new Date().toLocaleDateString()}</p>
              <div className="flex space-x-2">
                <button className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                  Edit
                </button>
                <button className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors">
                  Purchase
                </button>
                <button className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Want to try creating something new?</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Start a Fresh Design
        </button>
      </div>
    </div>
  );
}
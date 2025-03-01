export default function Shop() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shop AI-Generated T-Shirts</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        <aside className="w-full md:w-64 mb-6">
          <div className="border rounded-lg p-4 sticky top-4">
            <h2 className="font-semibold text-lg mb-3">Filters</h2>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-1">
                {['Abstract', 'Nature', 'Geometric', 'Artistic', 'Minimalist'].map(category => (
                  <div key={category} className="flex items-center">
                    <input type="checkbox" id={category} className="mr-2" />
                    <label htmlFor={category}>{category}</label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Price Range</h3>
              <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  placeholder="Min" 
                  className="w-full p-1 border rounded" 
                />
                <span>-</span>
                <input 
                  type="number" 
                  placeholder="Max" 
                  className="w-full p-1 border rounded" 
                />
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
              Apply Filters
            </button>
          </div>
        </aside>
        
        <div className="flex-1">
          <div className="flex justify-between items-center mb-4">
            <p className="text-gray-600">Showing 9 of 24 designs</p>
            <select className="border rounded p-1">
              <option>Sort by: Featured</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest First</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
              <div key={item} className="border rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-200 h-64 flex items-center justify-center">
                  <span className="text-gray-500">T-Shirt Image {item}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">AI Design #{item}</h3>
                  <p className="text-gray-600 mb-2">Unique abstract pattern with vibrant colors</p>
                  <p className="font-bold text-lg">$29.99</p>
                  <button className="mt-2 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors">
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-8 flex justify-center">
            <div className="flex space-x-1">
              {[1, 2, 3].map(page => (
                <button 
                  key={page}
                  className={`px-3 py-1 rounded ${
                    page === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Cart() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Shopping Cart (3 items)</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-2/3">
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { id: 1, name: 'Abstract Wave T-Shirt', size: 'M', price: 29.99, quantity: 1 },
                  { id: 2, name: 'Geometric Pattern T-Shirt', size: 'L', price: 29.99, quantity: 1 },
                  { id: 3, name: 'Nature Inspired T-Shirt', size: 'S', price: 29.99, quantity: 1 }
                ].map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded flex items-center justify-center">
                          <span className="text-xs text-gray-500">Image</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">AI-Generated Design</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.size}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center border rounded-md w-24">
                        <button className="px-2 py-1 text-gray-500 hover:text-gray-700">-</button>
                        <span className="flex-1 text-center">{item.quantity}</span>
                        <button className="px-2 py-1 text-gray-500 hover:text-gray-700">+</button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${item.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="lg:w-1/3">
          <div className="border rounded-lg p-6 bg-gray-50">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>$89.97</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>$4.99</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (estimated)</span>
                <span>$7.20</span>
              </div>
              <div className="border-t pt-3 mt-3 font-semibold flex justify-between">
                <span>Total</span>
                <span>$102.16</span>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="promoCode" className="block text-sm font-medium text-gray-700 mb-1">
                Promo Code
              </label>
              <div className="flex">
                <input
                  type="text"
                  id="promoCode"
                  className="flex-1 border rounded-l p-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter code"
                />
                <button className="bg-gray-200 px-4 py-2 rounded-r text-gray-700 hover:bg-gray-300">
                  Apply
                </button>
              </div>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors">
              Proceed to Checkout
            </button>
            
            <div className="mt-4 text-center">
              <a href="/shop" className="text-blue-600 hover:underline">
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function Orders() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Orders</h1>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <select className="border rounded p-2 w-full">
            <option value="">All Orders</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-6">
        {[
          { 
            id: '2024-1001', 
            date: '2024-02-28', 
            total: 59.98, 
            status: 'Delivered',
            items: 2,
            statusColor: 'bg-green-100 text-green-800'
          },
          { 
            id: '2024-1002', 
            date: '2024-02-15', 
            total: 29.99, 
            status: 'Shipped',
            items: 1,
            statusColor: 'bg-blue-100 text-blue-800'
          },
          { 
            id: '2024-1003', 
            date: '2024-02-05', 
            total: 89.97, 
            status: 'Processing',
            items: 3,
            statusColor: 'bg-yellow-100 text-yellow-800'
          }
        ].map((order) => (
          <div key={order.id} className="border rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 border-b flex flex-col sm:flex-row justify-between gap-2">
              <div>
                <div className="text-sm text-gray-500">Order #{order.id}</div>
                <div className="font-medium">Placed on {order.date}</div>
              </div>
              <div className="flex flex-col sm:items-end">
                <div className="font-medium">${order.total.toFixed(2)}</div>
                <div className={`inline-flex px-2 py-1 rounded-full text-xs ${order.statusColor}`}>
                  {order.status}
                </div>
              </div>
            </div>
            
            <div className="p-4">
              <div className="text-sm text-gray-500 mb-3">{order.items} items</div>
              
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <button className="text-blue-600 hover:underline">Track Order</button>
                  <button className="text-blue-600 hover:underline">View Details</button>
                </div>
                
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                  Buy Again
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 border-t pt-6 text-center">
        <p className="text-gray-600 mb-4">Don't see what you're looking for?</p>
        <button className="text-blue-600 hover:underline">
          View Order History
        </button>
      </div>
    </div>
  );
}
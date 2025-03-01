export default function Profile() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="border rounded-lg p-6 bg-white">
            <div className="flex flex-col items-center mb-6">
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">John Doe</h2>
              <p className="text-gray-600">Member since Jan 2024</p>
            </div>
            
            <ul className="space-y-2">
              <li>
                <button className="w-full text-left py-2 px-4 rounded bg-blue-50 text-blue-700 font-medium">
                  Account Information
                </button>
              </li>
              <li>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                  My Designs
                </button>
              </li>
              <li>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                  Order History
                </button>
              </li>
              <li>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                  Addresses
                </button>
              </li>
              <li>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                  Payment Methods
                </button>
              </li>
              <li>
                <button className="w-full text-left py-2 px-4 rounded hover:bg-gray-50 text-gray-700">
                  Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6 bg-white mb-6">
            <h2 className="text-xl font-semibold mb-4">Account Information</h2>
            
            <form>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="John"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    defaultValue="Doe"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="john.doe@example.com"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  defaultValue="(555) 123-4567"
                />
              </div>
              
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Save Changes
              </button>
            </form>
          </div>
          
          <div className="border rounded-lg p-6 bg-white">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            
            <form>
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
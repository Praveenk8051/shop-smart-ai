/**
 * This is a simple test script to manually test API endpoints
 * Create a database and run this script to test the API functionality
 * 
 * To run this script:
 * 1. Make sure your database is running
 * 2. Run the Prisma migration: npx prisma migrate dev
 * 3. Start the Next.js server: npm run dev
 * 4. Use this file to test the API endpoints
 */

// Step 1: Test User Registration
async function testUserRegistration() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('User Registration Response:', data);
    return data;
  } catch (error) {
    console.error('Error testing user registration:', error);
    return null;
  }
}

// Step 2: Test User Login
async function testUserLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

    const data = await response.json();
    console.log('User Login Response:', data);
    return data.data?.token;
  } catch (error) {
    console.error('Error testing user login:', error);
    return null;
  }
}

// Step 3: Test User Profile
async function testUserProfile(token: string) {
  try {
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await response.json();
    console.log('User Profile Response:', data);
    return data;
  } catch (error) {
    console.error('Error testing user profile:', error);
    return null;
  }
}

// Step 4: Test Products List
async function testProductsList() {
  try {
    const response = await fetch('http://localhost:3000/api/products');
    const data = await response.json();
    console.log('Products List Response:', data);
    
    // Return the first product ID for further testing
    return data.data?.products?.[0]?.id;
  } catch (error) {
    console.error('Error testing products list:', error);
    return null;
  }
}

// Step 5: Test Single Product
async function testSingleProduct(productId: string) {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${productId}`);
    const data = await response.json();
    console.log('Single Product Response:', data);
    return data;
  } catch (error) {
    console.error('Error testing single product:', error);
    return null;
  }
}

// Run the tests
async function runTests() {
  console.log('Starting API tests...');
  
  // Test user registration
  await testUserRegistration();
  
  // Test user login
  const token = await testUserLogin();
  if (!token) {
    console.error('Login failed, cannot continue with authenticated tests');
    return;
  }
  
  // Test user profile
  await testUserProfile(token);
  
  // Test products list
  const productId = await testProductsList();
  if (!productId) {
    console.error('Product list failed or empty, cannot test single product');
    return;
  }
  
  // Test single product
  await testSingleProduct(productId);
  
  console.log('All tests completed!');
}

// Only run if this file is executed directly
if (require.main === module) {
  runTests();
}
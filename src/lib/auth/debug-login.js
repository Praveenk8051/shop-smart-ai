// This is a debug script to test the login functionality

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

// Create a Prisma client instance
const prisma = new PrismaClient();

// Function to compare passwords (copied from auth.ts)
async function comparePasswords(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

// Function to test login with provided credentials
async function debugLogin(email, password) {
  try {
    console.log(`Attempting login with email: ${email}`);
    
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      console.log('User not found');
      return { success: false, error: 'User not found' };
    }
    
    console.log('User found with ID:', user.id);
    console.log('User data:', JSON.stringify(user, null, 2));
    
    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Password is invalid');
      return { success: false, error: 'Invalid password' };
    }
    
    console.log('Password is valid!');
    return { success: true, user: { id: user.id, email: user.email } };
    
  } catch (error) {
    console.error('Debug login error:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  } finally {
    // Disconnect from the database
    await prisma.$disconnect();
  }
}

// Main function to run the debug script
async function main() {
  const args = process.argv.slice(2);
  const email = args[0] || 'admin@example.com';
  const password = args[1] || 'admin123';
  
  console.log('Testing login with:', email, password);
  const result = await debugLogin(email, password);
  
  console.log('Result:', JSON.stringify(result, null, 2));
}

// Run the main function
main().catch(console.error);
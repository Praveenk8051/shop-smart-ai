import { comparePasswords } from './server/auth';

// Test function to directly check if password comparison works
export async function testPasswordComparison(plainPassword: string, hashedPassword: string) {
  try {
    const isValid = await comparePasswords(plainPassword, hashedPassword);
    return {
      success: true,
      isMatch: isValid,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      isMatch: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
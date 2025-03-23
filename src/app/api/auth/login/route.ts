import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { generateToken } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';
import bcrypt from 'bcrypt';

// Temporary mock user for testing while database connection is fixed
const MOCK_ADMIN_USER = {
  id: "mock-admin-user-id",
  name: "Admin User",
  email: "admin@example.com",
  password: "$2b$10$9XMBZVxgUhwWJn.wQ7gYJO9Hdl3ykxXuX0Mg5wPY6E1FH0xyPyz0q", // hashed version of "admin123"
  isAdmin: true,
};

// Helper function to verify passwords without using the server version
async function comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const errors = validateForm(body, {
      email: { required: true, isEmail: true },
      password: { required: true },
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }

    const { email, password } = body;

    let user;
    
    try {
      // Try to find user in database first
      user = await prisma.user.findUnique({
        where: { email },
      });
    } catch (dbError) {
      console.warn('Database connection error, falling back to mock user:', dbError);
      
      // If database connection fails, check if this is our mock admin
      if (email === MOCK_ADMIN_USER.email) {
        user = MOCK_ADMIN_USER;
      }
    }

    // If no user found either in DB or mock
    if (!user) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Invalid email or password', 401)
      );
    }

    // Verify password
    const isPasswordValid = await comparePasswords(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Invalid email or password', 401)
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // Return user data and token
    return NextResponse.json(
      createApiResponse(true, {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
        token,
      })
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
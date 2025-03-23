import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { generateToken } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';
import bcrypt from 'bcrypt';

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

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // If no user found
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
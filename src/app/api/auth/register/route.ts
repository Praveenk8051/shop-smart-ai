import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { hashPassword } from '@/lib/auth/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate input
    const errors = validateForm(body, {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, isEmail: true },
      password: { required: true, minLength: 8 },
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }

    const { name, email, password } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Email already in use', 409)
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      createApiResponse(true, { user: newUser }, undefined, 201)
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
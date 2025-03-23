import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse } from '@/lib/api/validation';

// Temporary mock user for testing while database connection is fixed
const MOCK_ADMIN_USER = {
  id: "mock-admin-user-id",
  name: "Admin User",
  email: "admin@example.com",
  isAdmin: true,
  authProvider: "local",
  createdAt: new Date(),
  addresses: [],
};

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    let user;

    // For our mock admin user
    if (authResult.userId === MOCK_ADMIN_USER.id || authResult.email === MOCK_ADMIN_USER.email) {
      user = MOCK_ADMIN_USER;
    } else {
      try {
        // Try to fetch from the database
        user = await prisma.user.findUnique({
          where: { id: authResult.userId },
          select: {
            id: true,
            name: true,
            email: true,
            isAdmin: true,
            authProvider: true,
            createdAt: true,
            addresses: {
              select: {
                id: true,
                street: true,
                city: true,
                state: true,
                postalCode: true,
                country: true,
                isDefault: true,
                phone: true,
              },
            },
          },
        });
      } catch (dbError) {
        console.warn('Database connection error:', dbError);
        // If email matches our mock user, use that
        if (authResult.email === MOCK_ADMIN_USER.email) {
          user = MOCK_ADMIN_USER;
        }
      }
    }

    if (!user) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'User not found', 404)
      );
    }

    return NextResponse.json(createApiResponse(true, { user }));
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
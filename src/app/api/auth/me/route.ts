import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse } from '@/lib/api/validation';

export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    // Fetch user information
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: {
        id: true,
        name: true,
        email: true,
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
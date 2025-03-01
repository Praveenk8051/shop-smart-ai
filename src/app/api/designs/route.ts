import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';
import { uploadToS3 } from '@/lib/storage/s3';

// GET all designs for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { searchParams } = new URL(req.url);
    
    // Pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    // Query designs
    const [designs, totalCount] = await Promise.all([
      prisma.design.findMany({
        where: {
          userId: authResult.userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.design.count({
        where: {
          userId: authResult.userId,
        },
      }),
    ]);
    
    return NextResponse.json(
      createApiResponse(true, {
        designs,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      })
    );
  } catch (error) {
    console.error('Get designs error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// POST to save a new design
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }
    
    // Process form data for image upload
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const prompt = formData.get('prompt') as string;
    const isPublic = formData.get('isPublic') === 'true';
    
    // Validate input
    if (!file) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'No design image provided', 400)
      );
    }
    
    if (!prompt) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Design prompt is required', 400)
      );
    }
    
    // Validate image file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        createApiResponse(
          false,
          undefined,
          'Invalid file type. Only JPEG, PNG, and WebP are allowed.',
          400
        )
      );
    }
    
    // Get file buffer
    const buffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(buffer);
    
    // Upload to S3
    const { key, url } = await uploadToS3(
      fileBuffer,
      `design-${authResult.userId}-${Date.now()}-${file.name}`,
      file.type
    );
    
    // Save design to database
    const design = await prisma.design.create({
      data: {
        userId: authResult.userId,
        prompt,
        s3Key: key,
        s3Url: url,
        isPublic,
      },
    });
    
    return NextResponse.json(
      createApiResponse(true, { design }, undefined, 201)
    );
  } catch (error) {
    console.error('Save design error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
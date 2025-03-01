import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/auth';
import { createApiResponse } from '@/lib/api/validation';
import { uploadToS3, deleteFromS3 } from '@/lib/storage/s3';

// POST to upload images to a product (admin only)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user (should be admin)
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { id } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    // Process form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'No file uploaded', 400)
      );
    }
    
    const imageType = formData.get('imageType') as string || 'detail';
    const altText = formData.get('altText') as string || existingProduct.name;

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
      `${id}-${Date.now()}-${file.name}`,
      file.type
    );

    // Create image record in database
    const image = await prisma.image.create({
      data: {
        productId: id,
        s3Key: key,
        s3Url: url,
        imageType,
        altText,
      },
    });

    return NextResponse.json(
      createApiResponse(true, { image }, undefined, 201)
    );
  } catch (error) {
    console.error('Upload image error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// GET all images for a product
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if product exists and is active
    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
        isActive: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    // Get all images for the product
    const images = await prisma.image.findMany({
      where: {
        productId: id,
      },
      orderBy: {
        uploadDate: 'desc',
      },
    });

    return NextResponse.json(createApiResponse(true, { images }));
  } catch (error) {
    console.error('Get product images error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
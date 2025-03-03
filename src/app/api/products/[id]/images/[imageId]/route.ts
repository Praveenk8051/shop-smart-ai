import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse } from '@/lib/api/validation';
import { deleteFromS3 } from '@/lib/storage/s3';

// GET a specific image
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const { id, imageId } = params;

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

    // Get the specific image
    const image = await prisma.image.findUnique({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!image) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Image not found', 404)
      );
    }

    return NextResponse.json(createApiResponse(true, { image }));
  } catch (error) {
    console.error('Get image error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// PUT to update image metadata (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    // Authenticate user (should be admin)
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { id, imageId } = params;
    const body = await req.json();

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    // Check if image exists for this product
    const existingImage = await prisma.image.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!existingImage) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Image not found for this product', 404)
      );
    }

    // Update the image metadata
    const updateData: any = {};
    
    if (body.imageType !== undefined) updateData.imageType = body.imageType;
    if (body.altText !== undefined) updateData.altText = body.altText;

    // Update the image
    const updatedImage = await prisma.image.update({
      where: { id: imageId },
      data: updateData,
    });

    return NextResponse.json(createApiResponse(true, { image: updatedImage }));
  } catch (error) {
    console.error('Update image error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// DELETE an image (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    // Authenticate user (should be admin)
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { id, imageId } = params;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    // Check if image exists for this product
    const existingImage = await prisma.image.findFirst({
      where: {
        id: imageId,
        productId: id,
      },
    });

    if (!existingImage) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Image not found for this product', 404)
      );
    }

    // Delete from S3
    await deleteFromS3(existingImage.s3Key);

    // Delete from database
    await prisma.image.delete({
      where: { id: imageId },
    });

    return NextResponse.json(
      createApiResponse(true, { message: 'Image successfully deleted' })
    );
  } catch (error) {
    console.error('Delete image error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';

// GET a single product by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Validate the ID
    if (!id) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product ID is required', 400)
      );
    }

    // Get the product with details
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          select: {
            id: true,
            s3Url: true,
            imageType: true,
            altText: true,
          },
        },
        sizes: {
          select: {
            id: true,
            name: true,
          },
        },
        colors: {
          select: {
            id: true,
            name: true,
            hexCode: true,
            imageUrl: true,
          },
        },
        inventory: {
          select: {
            id: true,
            sizeId: true,
            colorId: true,
            quantity: true,
            size: {
              select: {
                name: true,
              },
            },
            color: {
              select: {
                name: true,
                hexCode: true,
              },
            },
          },
        },
        designType: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product is not available', 404)
      );
    }

    return NextResponse.json(createApiResponse(true, { product }));
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// PUT to update a product (admin only)
export async function PUT(
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
    const body = await req.json();

    // Validate input
    const errors = validateForm(body, {
      name: { minLength: 3, maxLength: 100 },
      description: { minLength: 10 },
      basePrice: { isDecimal: true, min: 0 },
    });

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Product not found', 404)
      );
    }

    // Update product data
    const updateData: any = {};
    
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.basePrice !== undefined) updateData.basePrice = body.basePrice;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Handle connections
    const sizeOperations: any = {};
    const colorOperations: any = {};

    // Add or remove sizes
    if (body.sizeIdsToAdd && body.sizeIdsToAdd.length > 0) {
      sizeOperations.connect = body.sizeIdsToAdd.map((id: string) => ({ id }));
    }
    if (body.sizeIdsToRemove && body.sizeIdsToRemove.length > 0) {
      sizeOperations.disconnect = body.sizeIdsToRemove.map((id: string) => ({ id }));
    }

    // Add or remove colors
    if (body.colorIdsToAdd && body.colorIdsToAdd.length > 0) {
      colorOperations.connect = body.colorIdsToAdd.map((id: string) => ({ id }));
    }
    if (body.colorIdsToRemove && body.colorIdsToRemove.length > 0) {
      colorOperations.disconnect = body.colorIdsToRemove.map((id: string) => ({ id }));
    }

    // Add to update data if operations exist
    if (Object.keys(sizeOperations).length > 0) {
      updateData.sizes = sizeOperations;
    }
    if (Object.keys(colorOperations).length > 0) {
      updateData.colors = colorOperations;
    }

    // Update design type if provided
    if (body.designTypeId !== undefined) {
      updateData.designType = {
        connect: { id: body.designTypeId },
      };
    }

    // Update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        sizes: {
          select: {
            id: true,
            name: true,
          },
        },
        colors: {
          select: {
            id: true,
            name: true,
            hexCode: true,
          },
        },
      },
    });

    // Create new inventory entries for added size/color combinations
    if (body.sizeIdsToAdd?.length && body.colorIdsToAdd?.length) {
      const newInventoryEntries = [];
      
      // Create entries for new sizes with existing colors
      for (const sizeId of body.sizeIdsToAdd) {
        const existingColors = updatedProduct.colors.filter(
          color => !body.colorIdsToAdd.includes(color.id)
        );
        
        for (const color of existingColors) {
          newInventoryEntries.push({
            productId: id,
            sizeId,
            colorId: color.id,
            quantity: 0,
          });
        }
      }
      
      // Create entries for new colors with existing sizes
      for (const colorId of body.colorIdsToAdd) {
        const existingSizes = updatedProduct.sizes.filter(
          size => !body.sizeIdsToAdd.includes(size.id)
        );
        
        for (const size of existingSizes) {
          newInventoryEntries.push({
            productId: id,
            sizeId: size.id,
            colorId,
            quantity: 0,
          });
        }
      }
      
      // Create entries for new sizes with new colors
      for (const sizeId of body.sizeIdsToAdd) {
        for (const colorId of body.colorIdsToAdd) {
          newInventoryEntries.push({
            productId: id,
            sizeId,
            colorId,
            quantity: 0,
          });
        }
      }
      
      if (newInventoryEntries.length > 0) {
        await prisma.inventory.createMany({
          data: newInventoryEntries,
          skipDuplicates: true,
        });
      }
    }

    // Remove inventory entries for removed size/color combinations
    if (body.sizeIdsToRemove?.length || body.colorIdsToRemove?.length) {
      const deleteWhere: any = {
        productId: id,
        OR: [],
      };
      
      if (body.sizeIdsToRemove?.length) {
        deleteWhere.OR.push({
          sizeId: {
            in: body.sizeIdsToRemove,
          },
        });
      }
      
      if (body.colorIdsToRemove?.length) {
        deleteWhere.OR.push({
          colorId: {
            in: body.colorIdsToRemove,
          },
        });
      }
      
      await prisma.inventory.deleteMany({
        where: deleteWhere,
      });
    }

    return NextResponse.json(
      createApiResponse(true, { product: updatedProduct })
    );
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// DELETE a product (admin only)
export async function DELETE(
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

    // Instead of hard deleting, mark as inactive
    await prisma.product.update({
      where: { id },
      data: {
        isActive: false,
      },
    });

    return NextResponse.json(
      createApiResponse(true, { message: 'Product successfully deactivated' })
    );
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
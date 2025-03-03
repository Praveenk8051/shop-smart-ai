import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';

// GET all products with filtering options
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    // Basic query params
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = searchParams.get('maxPrice') 
      ? parseFloat(searchParams.get('maxPrice') as string) 
      : undefined;
    
    // Size and color filtering
    const sizeId = searchParams.get('sizeId');
    const colorId = searchParams.get('colorId');
    
    // Build query
    const where: any = {
      isActive: true,
    };
    
    // Search by name or description
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    // Price range
    where.basePrice = {
      gte: minPrice,
      ...(maxPrice !== undefined && { lte: maxPrice }),
    };
    
    // Size and color filtering relationships
    if (sizeId) {
      where.sizes = {
        some: {
          id: sizeId,
        },
      };
    }
    
    if (colorId) {
      where.colors = {
        some: {
          id: colorId,
        },
      };
    }
    
    // Handle pagination
    const skip = (page - 1) * limit;
    
    // Query products with counts
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          basePrice: true,
          images: {
            where: {
              imageType: 'primary',
            },
            take: 1,
            select: {
              id: true,
              s3Url: true,
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
            },
          },
          inventory: {
            select: {
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
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);
    
    // Return results with pagination info
    return NextResponse.json(
      createApiResponse(true, {
        products,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      })
    );
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// POST to create a new product (admin only)
export async function POST(req: NextRequest) {
  try {
    // Authenticate user (should be admin)
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate input
    const errors = validateForm(body, {
      name: { required: true, minLength: 3, maxLength: 100 },
      description: { required: true, minLength: 10 },
      basePrice: { required: true, isDecimal: true, min: 0 },
      sizeIds: { required: true },
      colorIds: { required: true },
    });
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }
    
    const { name, description, basePrice, sizeIds, colorIds, designTypeId } = body;
    
    // Check if sizes and colors exist
    const sizes = await prisma.size.findMany({
      where: {
        id: {
          in: sizeIds,
        },
      },
    });
    
    if (sizes.length !== sizeIds.length) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'One or more sizes not found', 400)
      );
    }
    
    const colors = await prisma.color.findMany({
      where: {
        id: {
          in: colorIds,
        },
      },
    });
    
    if (colors.length !== colorIds.length) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'One or more colors not found', 400)
      );
    }
    
    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description,
        basePrice,
        designTypeId,
        sizes: {
          connect: sizeIds.map((id: string) => ({ id })),
        },
        colors: {
          connect: colorIds.map((id: string) => ({ id })),
        },
      },
    });
    
    // Create inventory entries for all size/color combinations
    const inventoryData = [];
    for (const sizeId of sizeIds) {
      for (const colorId of colorIds) {
        inventoryData.push({
          productId: product.id,
          sizeId,
          colorId,
          quantity: 0, // Default to 0 stock
        });
      }
    }
    
    await prisma.inventory.createMany({
      data: inventoryData,
    });
    
    return NextResponse.json(
      createApiResponse(true, { product }, undefined, 201)
    );
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
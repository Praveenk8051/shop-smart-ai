import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';

// GET all orders for the authenticated user
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
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Filter by status
    const status = searchParams.get('status');
    
    // Build query
    const where: any = {
      userId: authResult.userId!,
    };
    
    if (status) {
      where.status = status;
    }
    
    // Query orders with count
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          updatedAt: true,
          trackingNumber: true,
          orderItems: {
            select: {
              id: true,
              quantity: true,
              price: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  images: {
                    where: {
                      imageType: 'primary',
                    },
                    take: 1,
                    select: {
                      s3Url: true,
                    },
                  },
                },
              },
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
          shippingAddress: {
            select: {
              street: true,
              city: true,
              state: true,
              postalCode: true,
              country: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    
    return NextResponse.json(
      createApiResponse(true, {
        orders,
        pagination: {
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limit),
          currentPage: page,
          itemsPerPage: limit,
        },
      })
    );
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// POST to create a new order
export async function POST(req: NextRequest) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const body = await req.json();
    
    // Validate input
    const errors = validateForm(body, {
      addressId: { required: true },
      items: { required: true },
    });
    
    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }
    
    const { addressId, items } = body;
    
    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: authResult.userId!,
      },
    });
    
    if (!address) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Invalid address', 400)
      );
    }
    
    // Verify items and calculate total
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'No items in order', 400)
      );
    }
    
    // Define proper type for order items
    interface OrderItem {
      productId: string;
      sizeId: string;
      colorId: string;
      quantity: number;
      price: number;
      designUrl?: string;
    }
    
    const orderItems: OrderItem[] = [];
    let orderTotal = 0;
    
    // Verify each item and check inventory
    for (const item of items) {
      const { productId, sizeId, colorId, quantity, designUrl } = item;
      
      if (!productId || !sizeId || !colorId || !quantity) {
        return NextResponse.json(
          createApiResponse(false, undefined, 'Invalid item in order', 400)
        );
      }
      
      // Get product info
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
          isActive: true,
        },
      });
      
      if (!product) {
        return NextResponse.json(
          createApiResponse(false, undefined, `Product ${productId} not found or inactive`, 400)
        );
      }
      
      // Check inventory
      const inventory = await prisma.inventory.findUnique({
        where: {
          productId_sizeId_colorId: {
            productId,
            sizeId,
            colorId,
          },
        },
      });
      
      if (!inventory) {
        return NextResponse.json(
          createApiResponse(
            false,
            undefined,
            `Product ${productId} not available in selected size and color`,
            400
          )
        );
      }
      
      if (inventory.quantity < quantity) {
        return NextResponse.json(
          createApiResponse(
            false,
            undefined,
            `Not enough stock for ${product.name}. Available: ${inventory.quantity}`,
            400
          )
        );
      }
      
      // Add to order items
      orderItems.push({
        productId,
        sizeId,
        colorId,
        quantity,
        price: product.basePrice,
        ...(designUrl && { designUrl }),
      });
      
      // Add to order total
      orderTotal += parseFloat(product.basePrice.toString()) * quantity;
    }
    
    // Create order in transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: authResult.userId!,
          addressId,
          total: orderTotal,
          orderItems: {
            create: orderItems,
          },
        },
        include: {
          orderItems: true,
        },
      });
      
      // Update inventory
      for (const item of newOrder.orderItems) {
        await tx.inventory.update({
          where: {
            productId_sizeId_colorId: {
              productId: item.productId,
              sizeId: item.sizeId,
              colorId: item.colorId,
            },
          },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }
      
      return newOrder;
    });
    
    return NextResponse.json(
      createApiResponse(true, { order }, undefined, 201)
    );
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
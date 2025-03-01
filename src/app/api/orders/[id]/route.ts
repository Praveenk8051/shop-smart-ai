import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { authenticate } from '@/lib/auth/auth';
import { createApiResponse } from '@/lib/api/validation';

// GET a specific order
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { id } = params;

    // Get the order with details
    const order = await prisma.order.findUnique({
      where: {
        id,
        userId: authResult.userId, // Ensure user can only see their own orders
      },
      include: {
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                description: true,
                images: {
                  where: {
                    imageType: 'primary',
                  },
                  take: 1,
                  select: {
                    s3Url: true,
                    altText: true,
                  },
                },
              },
            },
            size: true,
            color: true,
          },
        },
        shippingAddress: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Order not found', 404)
      );
    }

    return NextResponse.json(createApiResponse(true, { order }));
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// PUT to cancel an order (user can only cancel their own orders in PENDING status)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return NextResponse.json(
        createApiResponse(false, undefined, authResult.error, 401)
      );
    }

    const { id } = params;
    const body = await req.json();
    const { action } = body; // Expected action: 'cancel'

    if (action !== 'cancel') {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Invalid action', 400)
      );
    }

    // Find the order
    const order = await prisma.order.findUnique({
      where: {
        id,
        userId: authResult.userId, // Ensure user can only cancel their own orders
      },
      include: {
        orderItems: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Order not found', 404)
      );
    }

    // Check if order is in PENDING status
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        createApiResponse(
          false,
          undefined,
          'Only orders in PENDING status can be cancelled',
          400
        )
      );
    }

    // Update order in a transaction
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Update order status
      const updated = await tx.order.update({
        where: { id },
        data: {
          status: 'CANCELLED',
        },
      });

      // Restore inventory
      for (const item of order.orderItems) {
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
              increment: item.quantity,
            },
          },
        });
      }

      return updated;
    });

    return NextResponse.json(
      createApiResponse(true, { order: updatedOrder })
    );
  } catch (error) {
    console.error('Cancel order error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
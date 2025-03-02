import db from '../postgres';

type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'RETURNED';
type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: number;
  addressId?: string;
  trackingNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  sizeId: string;
  colorId: string;
  designUrl?: string;
}

export const orderRepository = {
  findById: async (id: string): Promise<Order | null> => {
    const result = await db.querySingle(
      'SELECT id, user_id as "userId", status, payment_status as "paymentStatus", total, address_id as "addressId", tracking_number as "trackingNumber", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE id = $1',
      [id]
    );
    return result || null;
  },

  findByUserId: async (userId: string, limit = 10, offset = 0): Promise<Order[]> => {
    const result = await db.query(
      'SELECT id, user_id as "userId", status, payment_status as "paymentStatus", total, address_id as "addressId", tracking_number as "trackingNumber", created_at as "createdAt", updated_at as "updatedAt" FROM orders WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  },

  findItemsByOrderId: async (orderId: string): Promise<OrderItem[]> => {
    const result = await db.query(
      'SELECT id, order_id as "orderId", product_id as "productId", quantity, price, size_id as "sizeId", color_id as "colorId", design_url as "designUrl" FROM order_items WHERE order_id = $1',
      [orderId]
    );
    return result.rows;
  },

  create: async (data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> => {
    return await db.transaction(async (client) => {
      const now = new Date();
      
      // Create the order
      const orderResult = await client.query(
        'INSERT INTO orders (user_id, status, payment_status, total, address_id, tracking_number, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, user_id as "userId", status, payment_status as "paymentStatus", total, address_id as "addressId", tracking_number as "trackingNumber", created_at as "createdAt", updated_at as "updatedAt"',
        [data.userId, data.status, data.paymentStatus, data.total, data.addressId, data.trackingNumber, now, now]
      );
      
      return orderResult.rows[0];
    });
  },

  addOrderItem: async (orderId: string, item: Omit<OrderItem, 'id' | 'orderId'>): Promise<OrderItem> => {
    const result = await db.querySingle(
      'INSERT INTO order_items (order_id, product_id, quantity, price, size_id, color_id, design_url) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, order_id as "orderId", product_id as "productId", quantity, price, size_id as "sizeId", color_id as "colorId", design_url as "designUrl"',
      [orderId, item.productId, item.quantity, item.price, item.sizeId, item.colorId, item.designUrl]
    );
    return result;
  },

  updateStatus: async (id: string, status: OrderStatus, paymentStatus?: PaymentStatus): Promise<Order> => {
    const updates: string[] = ['status = $1'];
    const values: any[] = [status, id];
    let paramIndex = 3;
    
    if (paymentStatus) {
      updates.push(`payment_status = $2`);
      values.splice(1, 0, paymentStatus);
    }
    
    updates.push(`updated_at = $${paramIndex - 1}`);
    values.splice(paramIndex - 2, 0, new Date());

    const result = await db.querySingle(
      `UPDATE orders SET ${updates.join(', ')} WHERE id = $${paramIndex - 1} RETURNING id, user_id as "userId", status, payment_status as "paymentStatus", total, address_id as "addressId", tracking_number as "trackingNumber", created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    return result;
  },

  updateTrackingNumber: async (id: string, trackingNumber: string): Promise<Order> => {
    const result = await db.querySingle(
      'UPDATE orders SET tracking_number = $1, updated_at = $2 WHERE id = $3 RETURNING id, user_id as "userId", status, payment_status as "paymentStatus", total, address_id as "addressId", tracking_number as "trackingNumber", created_at as "createdAt", updated_at as "updatedAt"',
      [trackingNumber, new Date(), id]
    );
    return result;
  },

  delete: async (id: string): Promise<void> => {
    await db.transaction(async (client) => {
      // Delete order items first due to foreign key constraints
      await client.query('DELETE FROM order_items WHERE order_id = $1', [id]);
      // Then delete the order
      await client.query('DELETE FROM orders WHERE id = $1', [id]);
    });
  }
};

export default orderRepository;
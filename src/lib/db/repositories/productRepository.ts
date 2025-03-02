import db from '../postgres';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  designTypeId?: string;
}

export const productRepository = {
  findById: async (id: string): Promise<Product | null> => {
    const result = await db.querySingle(
      'SELECT id, name, description, base_price as "basePrice", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt", design_type_id as "designTypeId" FROM products WHERE id = $1',
      [id]
    );
    return result || null;
  },

  findMany: async (limit = 10, offset = 0, isActive = true): Promise<Product[]> => {
    const result = await db.query(
      'SELECT id, name, description, base_price as "basePrice", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt", design_type_id as "designTypeId" FROM products WHERE is_active = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [isActive, limit, offset]
    );
    return result.rows;
  },

  findByDesignType: async (designTypeId: string, limit = 10, offset = 0): Promise<Product[]> => {
    const result = await db.query(
      'SELECT id, name, description, base_price as "basePrice", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt", design_type_id as "designTypeId" FROM products WHERE design_type_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [designTypeId, limit, offset]
    );
    return result.rows;
  },

  create: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
    const now = new Date();
    const result = await db.querySingle(
      'INSERT INTO products (name, description, base_price, is_active, created_at, updated_at, design_type_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name, description, base_price as "basePrice", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt", design_type_id as "designTypeId"',
      [data.name, data.description, data.basePrice, data.isActive ?? true, now, now, data.designTypeId]
    );
    return result;
  },

  update: async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.description) {
      updates.push(`description = $${paramIndex++}`);
      values.push(data.description);
    }
    if (data.basePrice !== undefined) {
      updates.push(`base_price = $${paramIndex++}`);
      values.push(data.basePrice);
    }
    if (data.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(data.isActive);
    }
    if (data.designTypeId !== undefined) {
      updates.push(`design_type_id = $${paramIndex++}`);
      values.push(data.designTypeId);
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await db.querySingle(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, name, description, base_price as "basePrice", is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt", design_type_id as "designTypeId"`,
      values
    );
    return result;
  },

  delete: async (id: string): Promise<void> => {
    await db.query('DELETE FROM products WHERE id = $1', [id]);
  }
};

export default productRepository;
import db from '../postgres';

interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const userRepository = {
  findById: async (id: string): Promise<User | null> => {
    const result = await db.querySingle(
      'SELECT id, email, name, password, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE id = $1',
      [id]
    );
    return result || null;
  },

  findByEmail: async (email: string): Promise<User | null> => {
    const result = await db.querySingle(
      'SELECT id, email, name, password, created_at as "createdAt", updated_at as "updatedAt" FROM users WHERE email = $1',
      [email]
    );
    return result || null;
  },

  findMany: async (limit = 10, offset = 0): Promise<User[]> => {
    const result = await db.query(
      'SELECT id, email, name, password, created_at as "createdAt", updated_at as "updatedAt" FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  },

  create: async (data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> => {
    const now = new Date();
    const result = await db.querySingle(
      'INSERT INTO users (email, name, password, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, password, created_at as "createdAt", updated_at as "updatedAt"',
      [data.email, data.name, data.password, now, now]
    );
    return result;
  },

  update: async (id: string, data: Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User> => {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (data.email) {
      updates.push(`email = $${paramIndex++}`);
      values.push(data.email);
    }
    if (data.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(data.name);
    }
    if (data.password) {
      updates.push(`password = $${paramIndex++}`);
      values.push(data.password);
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(new Date());
    values.push(id);

    const result = await db.querySingle(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING id, email, name, password, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    return result;
  },

  delete: async (id: string): Promise<void> => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  }
};

export default userRepository;
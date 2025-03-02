import { Pool } from 'pg';
import bcrypt from 'bcrypt';

// Create a connection pool
const pool = new Pool({
  user: process.env.POSTGRES_USER || 'postgres',
  host: process.env.POSTGRES_HOST || 'localhost',
  database: process.env.POSTGRES_DB || 'llm_ecommerce',
  password: process.env.POSTGRES_PASSWORD || 'Accenture@123',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

// Seed data
const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    console.log('Starting database seeding...');
    await client.query('BEGIN');

    // Hash passwords
    const passwordHash = await bcrypt.hash('password123', 10);
    
    // Insert users
    console.log('Seeding users...');
    const usersResult = await client.query(`
      INSERT INTO users (email, name, password)
      VALUES 
        ('john@example.com', 'John Doe', $1),
        ('jane@example.com', 'Jane Smith', $1)
      RETURNING id
    `, [passwordHash]);
    
    const userId1 = usersResult.rows[0].id;
    const userId2 = usersResult.rows[1].id;
    
    // Insert addresses
    console.log('Seeding addresses...');
    await client.query(`
      INSERT INTO addresses (user_id, street, city, state, postal_code, country, is_default, phone)
      VALUES 
        ($1, '123 Main St', 'New York', 'NY', '10001', 'USA', true, '555-1234'),
        ($2, '456 Elm St', 'San Francisco', 'CA', '94107', 'USA', true, '555-5678')
    `, [userId1, userId2]);
    
    // Insert design types
    console.log('Seeding design types...');
    const designTypesResult = await client.query(`
      INSERT INTO design_types (name, description)
      VALUES 
        ('Basic', 'Basic designs with no customization'),
        ('Custom', 'Custom designs created with AI'),
        ('Premium', 'Premium designer collections')
      RETURNING id
    `);
    
    const designTypeBasic = designTypesResult.rows[0].id;
    const designTypeCustom = designTypesResult.rows[1].id;
    
    // Insert products
    console.log('Seeding products...');
    const productsResult = await client.query(`
      INSERT INTO products (name, description, base_price, design_type_id)
      VALUES 
        ('Basic T-Shirt', 'A comfortable cotton t-shirt', 19.99, $1),
        ('Premium T-Shirt', 'High-quality fabric with a tailored fit', 29.99, $1),
        ('Custom AI T-Shirt', 'Create your own design using our AI tools', 34.99, $2)
      RETURNING id
    `, [designTypeBasic, designTypeCustom]);
    
    const productId1 = productsResult.rows[0].id;
    const productId2 = productsResult.rows[1].id;
    const productId3 = productsResult.rows[2].id;
    
    // Insert sizes
    console.log('Seeding sizes...');
    const sizesResult = await client.query(`
      INSERT INTO sizes (name)
      VALUES ('S'), ('M'), ('L'), ('XL'), ('XXL')
      RETURNING id, name
    `);
    
    const sizes = sizesResult.rows;
    
    // Insert colors
    console.log('Seeding colors...');
    const colorsResult = await client.query(`
      INSERT INTO colors (name, hex_code)
      VALUES 
        ('Black', '#000000'),
        ('White', '#FFFFFF'),
        ('Red', '#FF0000'),
        ('Blue', '#0000FF')
      RETURNING id, name
    `);
    
    const colors = colorsResult.rows;
    
    // Connect products with sizes
    console.log('Connecting products with sizes...');
    for (const product of productsResult.rows) {
      for (const size of sizes) {
        await client.query(`
          INSERT INTO product_sizes (product_id, size_id)
          VALUES ($1, $2)
        `, [product.id, size.id]);
      }
    }
    
    // Connect products with colors
    console.log('Connecting products with colors...');
    for (const product of productsResult.rows) {
      for (const color of colors) {
        await client.query(`
          INSERT INTO product_colors (product_id, color_id)
          VALUES ($1, $2)
        `, [product.id, color.id]);
      }
    }
    
    // Insert inventory
    console.log('Seeding inventory...');
    for (const product of productsResult.rows) {
      for (const size of sizes) {
        for (const color of colors) {
          await client.query(`
            INSERT INTO inventory (product_id, size_id, color_id, quantity)
            VALUES ($1, $2, $3, $4)
          `, [product.id, size.id, color.id, Math.floor(Math.random() * 100) + 10]);
        }
      }
    }
    
    // Insert images
    console.log('Seeding product images...');
    await client.query(`
      INSERT INTO images (product_id, s3_key, s3_url, image_type, alt_text)
      VALUES 
        ($1, 'products/tshirt-black.jpg', 'https://example-bucket.s3.amazonaws.com/products/tshirt-black.jpg', 'primary', 'Black T-Shirt'),
        ($2, 'products/premium-tshirt-white.jpg', 'https://example-bucket.s3.amazonaws.com/products/premium-tshirt-white.jpg', 'primary', 'White Premium T-Shirt'),
        ($3, 'products/custom-tshirt.jpg', 'https://example-bucket.s3.amazonaws.com/products/custom-tshirt.jpg', 'primary', 'Custom AI T-Shirt')
    `, [productId1, productId2, productId3]);
    
    // Create some sample orders
    console.log('Seeding orders...');
    const ordersResult = await client.query(`
      INSERT INTO orders (user_id, status, payment_status, total, address_id)
      VALUES 
        ($1, 'DELIVERED', 'PAID', 39.98, (SELECT id FROM addresses WHERE user_id = $1 LIMIT 1)),
        ($2, 'PENDING', 'PENDING', 104.97, (SELECT id FROM addresses WHERE user_id = $2 LIMIT 1))
      RETURNING id
    `, [userId1, userId2]);
    
    const orderId1 = ordersResult.rows[0].id;
    const orderId2 = ordersResult.rows[1].id;
    
    // Add order items
    console.log('Seeding order items...');
    await client.query(`
      INSERT INTO order_items (order_id, product_id, quantity, price, size_id, color_id)
      VALUES 
        ($1, $3, 2, 19.99, $5, $7),
        ($2, $4, 1, 29.99, $6, $8),
        ($2, $4, 1, 29.99, $6, $9),
        ($2, $4, 1, 34.99, $6, $9)
    `, [orderId1, orderId2, productId1, productId2, sizes[1].id, sizes[2].id, colors[0].id, colors[1].id, colors[2].id]);
    
    // Design items
    console.log('Seeding designs...');
    await client.query(`
      INSERT INTO designs (user_id, prompt, s3_key, s3_url, is_public)
      VALUES 
        ($1, 'A T-shirt with a mountain landscape', 'designs/mountain-landscape.jpg', 'https://example-bucket.s3.amazonaws.com/designs/mountain-landscape.jpg', true),
        ($2, 'A T-shirt with a space theme', 'designs/space-theme.jpg', 'https://example-bucket.s3.amazonaws.com/designs/space-theme.jpg', false)
    `, [userId1, userId2]);
    
    await client.query('COMMIT');
    console.log('Database seeding completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seed process completed');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seed process failed:', err);
      process.exit(1);
    });
}

export default seedDatabase;
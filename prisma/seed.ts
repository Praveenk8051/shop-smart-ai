import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed data creation...');

  // Clear existing data (for development purposes)
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.inventory.deleteMany({});
  await prisma.image.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.design.deleteMany({});
  await prisma.paymentMethod.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.size.deleteMany({});
  await prisma.color.deleteMany({});
  await prisma.designType.deleteMany({});

  // Create Users
  console.log('Creating users...');
  const user1 = await prisma.user.create({
    data: {
      name: 'John Doe',
      email: 'john@example.com',
      password: await hashPassword('password123'),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      password: await hashPassword('password123'),
    },
  });

  // Create Addresses
  console.log('Creating addresses...');
  const address1 = await prisma.address.create({
    data: {
      userId: user1.id,
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA',
      isDefault: true,
      phone: '555-123-4567',
    },
  });

  const address2 = await prisma.address.create({
    data: {
      userId: user2.id,
      street: '456 Park Ave',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA',
      isDefault: true,
      phone: '555-987-6543',
    },
  });

  // Create Sizes
  console.log('Creating sizes...');
  const sizes = await Promise.all([
    prisma.size.create({ data: { name: 'S' } }),
    prisma.size.create({ data: { name: 'M' } }),
    prisma.size.create({ data: { name: 'L' } }),
    prisma.size.create({ data: { name: 'XL' } }),
    prisma.size.create({ data: { name: 'XXL' } }),
  ]);

  // Create Colors
  console.log('Creating colors...');
  const colors = await Promise.all([
    prisma.color.create({
      data: {
        name: 'Black',
        hexCode: '#000000',
        imageUrl: '/images/black.JPG',
      },
    }),
    prisma.color.create({
      data: {
        name: 'White',
        hexCode: '#FFFFFF',
        imageUrl: '/images/white.jpg',
      },
    }),
    prisma.color.create({
      data: {
        name: 'Red',
        hexCode: '#FF0000',
        imageUrl: '/images/red.jpeg',
      },
    }),
    prisma.color.create({
      data: {
        name: 'Blue',
        hexCode: '#0000FF',
        imageUrl: '/images/bblue.jpeg',
      },
    }),
  ]);

  // Create Design Types
  console.log('Creating design types...');
  const designTypes = await Promise.all([
    prisma.designType.create({
      data: {
        name: 'AI Generated',
        description: 'Custom designs created using AI',
      },
    }),
    prisma.designType.create({
      data: {
        name: 'Pre-made',
        description: 'Professionally designed templates',
      },
    }),
  ]);

  // Create Products
  console.log('Creating products...');
  const product1 = await prisma.product.create({
    data: {
      name: 'Basic T-Shirt',
      description: 'A comfortable cotton t-shirt perfect for everyday wear',
      basePrice: 19.99,
      designTypeId: designTypes[1].id, // Pre-made
      sizes: {
        connect: sizes.map((size) => ({ id: size.id })),
      },
      colors: {
        connect: colors.map((color) => ({ id: color.id })),
      },
    },
  });

  const product2 = await prisma.product.create({
    data: {
      name: 'Premium T-Shirt',
      description: 'High-quality fabric with a tailored fit',
      basePrice: 29.99,
      designTypeId: designTypes[1].id, // Pre-made
      sizes: {
        connect: sizes.map((size) => ({ id: size.id })),
      },
      colors: {
        connect: colors.map((color) => ({ id: color.id })),
      },
    },
  });

  const product3 = await prisma.product.create({
    data: {
      name: 'Custom AI T-Shirt',
      description: 'Create your own design using our AI tools',
      basePrice: 34.99,
      designTypeId: designTypes[0].id, // AI Generated
      sizes: {
        connect: sizes.map((size) => ({ id: size.id })),
      },
      colors: {
        connect: colors.map((color) => ({ id: color.id })),
      },
    },
  });

  // Create Inventory
  console.log('Creating inventory...');
  const inventoryItems = [];

  for (const product of [product1, product2, product3]) {
    for (const size of sizes) {
      for (const color of colors) {
        inventoryItems.push({
          productId: product.id,
          sizeId: size.id,
          colorId: color.id,
          quantity: Math.floor(Math.random() * 50) + 10, // Random quantity between 10-60
        });
      }
    }
  }

  await prisma.inventory.createMany({
    data: inventoryItems,
  });

  // Create Images
  console.log('Creating product images...');
  await prisma.image.createMany({
    data: [
      {
        productId: product1.id,
        s3Key: 'basic-black-tshirt',
        s3Url: 'https://placehold.co/600x800/000000/FFFFFF.png?text=Basic+T-Shirt',
        imageType: 'primary',
        altText: 'Basic black t-shirt front view',
      },
      {
        productId: product1.id,
        s3Key: 'basic-black-tshirt-back',
        s3Url: 'https://placehold.co/600x800/000000/FFFFFF.png?text=Basic+T-Shirt+Back',
        imageType: 'detail',
        altText: 'Basic black t-shirt back view',
      },
      {
        productId: product2.id,
        s3Key: 'premium-blue-tshirt',
        s3Url: 'https://placehold.co/600x800/0000FF/FFFFFF.png?text=Premium+T-Shirt',
        imageType: 'primary',
        altText: 'Premium blue t-shirt front view',
      },
      {
        productId: product3.id,
        s3Key: 'custom-red-tshirt',
        s3Url: 'https://placehold.co/600x800/FF0000/FFFFFF.png?text=Custom+AI+T-Shirt',
        imageType: 'primary',
        altText: 'Custom red t-shirt with AI design',
      },
    ],
  });

  // Create some designs
  console.log('Creating sample designs...');
  await prisma.design.createMany({
    data: [
      {
        userId: user1.id,
        prompt: 'Mountain landscape with sunset',
        s3Key: 'design-1',
        s3Url: 'https://placehold.co/400x400/FF9900/FFFFFF.png?text=Mountain+Design',
        isPublic: true,
      },
      {
        userId: user1.id,
        prompt: 'Abstract geometric pattern',
        s3Key: 'design-2',
        s3Url: 'https://placehold.co/400x400/9900FF/FFFFFF.png?text=Abstract+Design',
        isPublic: false,
      },
      {
        userId: user2.id,
        prompt: 'Space theme with planets and stars',
        s3Key: 'design-3',
        s3Url: 'https://placehold.co/400x400/000066/FFFFFF.png?text=Space+Design',
        isPublic: true,
      },
    ],
  });

  // Create some orders
  console.log('Creating sample orders...');
  
  // Order for user 1
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      addressId: address1.id,
      total: 39.98, // 2 * 19.99
      status: 'DELIVERED',
      paymentStatus: 'PAID',
      trackingNumber: 'TRK12345678',
    },
  });

  // Order items for order 1
  await prisma.orderItem.create({
    data: {
      orderId: order1.id,
      productId: product1.id,
      quantity: 2,
      price: 19.99,
      sizeId: sizes[1].id, // M
      colorId: colors[0].id, // Black
    },
  });

  // Order for user 2
  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      addressId: address2.id,
      total: 94.97, // 29.99 + 2 * 34.99
      status: 'PROCESSING',
      paymentStatus: 'PAID',
    },
  });

  // Order items for order 2
  await prisma.orderItem.createMany({
    data: [
      {
        orderId: order2.id,
        productId: product2.id,
        quantity: 1,
        price: 29.99,
        sizeId: sizes[2].id, // L
        colorId: colors[1].id, // White
      },
      {
        orderId: order2.id,
        productId: product3.id,
        quantity: 2,
        price: 34.99,
        sizeId: sizes[3].id, // XL
        colorId: colors[2].id, // Red
        designUrl: 'https://placehold.co/400x400/9900FF/FFFFFF.png?text=Custom+Design',
      },
    ],
  });

  console.log('Seed data creation completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
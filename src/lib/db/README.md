# Database Migration: Prisma to PostgreSQL

This directory contains the implementation for migrating from Prisma ORM to direct PostgreSQL usage.

## Structure

```
lib/db/
├── migrations/               # SQL migration scripts
│   ├── 001_initial_schema.sql    # Initial database schema
│   ├── runMigrations.ts          # Migration runner script
│   └── seed.ts                   # Database seeding script
├── repositories/             # Data access repositories
│   ├── userRepository.ts         # User data operations
│   ├── productRepository.ts      # Product data operations
│   ├── orderRepository.ts        # Order data operations
│   └── index.ts                  # Repository exports
├── prisma.ts                # Original Prisma client (for backward compatibility)
├── postgres.ts              # PostgreSQL database client
└── README.md                # This documentation
```

## Database Client

The PostgreSQL client is implemented in `postgres.ts`. It provides:

- Connection pooling with the `pg` library
- Query performance logging (in development)
- Helper functions for common query patterns
- Transaction support

## Repositories

The repository pattern is used to encapsulate database operations:

- `userRepository`: User-related operations
- `productRepository`: Product-related operations
- `orderRepository`: Order and order item operations

Each repository provides methods for CRUD operations on its entity.

## Migration Scripts

Database schema and data migrations are managed through SQL scripts:

- `001_initial_schema.sql`: Creates the initial database schema
- `runMigrations.ts`: Utility to run migrations in order
- `seed.ts`: Populates the database with initial data

## Usage

### Environment Variables

Configure your PostgreSQL connection with these environment variables:

```
POSTGRES_USER=postgres
POSTGRES_HOST=localhost
POSTGRES_DB=llm_ecommerce
POSTGRES_PASSWORD=your_password
POSTGRES_PORT=5432
```

### Database Setup

Use these npm scripts to set up the database:

```
# Run all migrations
npm run db:migrate

# Seed the database with test data
npm run db:seed

# Run migrations and seeding together
npm run db:setup
```

### Using Repositories

```typescript
import { userRepository } from '../lib/db/repositories';

// Find a user
const user = await userRepository.findByEmail('user@example.com');

// Create a user
const newUser = await userRepository.create({
  email: 'new@example.com',
  name: 'New User',
  password: 'hashedpassword'
});
```

## Testing

Mock repositories for testing:

```typescript
import db from '../lib/db/postgres';

// Mock the postgres module
jest.mock('../lib/db/postgres', () => {
  return {
    query: jest.fn(),
    querySingle: jest.fn(),
    transaction: jest.fn(),
    pool: {
      query: jest.fn(),
      connect: jest.fn(),
      end: jest.fn(),
    }
  };
});

// Test a repository
test('should find user by email', async () => {
  const mockUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User'
  };
  
  (db.querySingle as jest.Mock).mockResolvedValue(mockUser);
  
  const user = await userRepository.findByEmail('test@example.com');
  expect(user.email).toBe('test@example.com');
});
```
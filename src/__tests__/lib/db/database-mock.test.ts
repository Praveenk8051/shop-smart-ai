// PostgreSQL database mock test
import { userRepository, productRepository } from '../../../lib/db/repositories';

// Mock the pg module
jest.mock('pg', () => {
  const mockPool = {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
  };
  
  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };
  
  mockPool.connect.mockResolvedValue(mockClient);
  
  return { 
    Pool: jest.fn(() => mockPool)
  };
});

// Mock the postgres.ts module
jest.mock('../../../lib/db/postgres', () => {
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

import db from '../../../lib/db/postgres';

describe('Database Mock Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User Repository', () => {
    it('should mock user findByEmail query', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock the db.querySingle function to return the mock user
      (db.querySingle as jest.Mock).mockResolvedValue(mockUser);

      const user = await userRepository.findByEmail('test@example.com');
      
      expect(db.querySingle).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'), 
        ['test@example.com']
      );
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });

    it('should mock user findMany query', async () => {
      const mockUsers = [{
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      // Mock the db.query function to return the mock users
      (db.query as jest.Mock).mockResolvedValue({ rows: mockUsers });

      const users = await userRepository.findMany();
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'), 
        [10, 0]
      );
      expect(users).toHaveLength(1);
      expect(users[0].name).toBe('Test User');
    });
  });

  describe('Product Repository', () => {
    it('should mock product findMany query', async () => {
      const mockProducts = [{
        id: '456',
        name: 'Test Product',
        description: 'Test Description',
        basePrice: 19.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      // Mock the db.query function to return the mock products
      (db.query as jest.Mock).mockResolvedValue({ rows: mockProducts });

      const products = await productRepository.findMany();
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'), 
        [true, 10, 0]
      );
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('Test Product');
      expect(products[0].basePrice).toBe(19.99);
    });
  });
});

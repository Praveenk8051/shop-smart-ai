import db from '../../../lib/db/postgres';
import { userRepository, productRepository } from '../../../lib/db/repositories';

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

describe('PostgreSQL Client', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should define the postgres client', () => {
    expect(db).toBeDefined();
    expect(db.query).toBeDefined();
    expect(db.querySingle).toBeDefined();
    expect(db.transaction).toBeDefined();
  });

  describe('User Repository', () => {
    it('should find user by email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedpassword',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (db.querySingle as jest.Mock).mockResolvedValue(mockUser);
      
      const user = await userRepository.findByEmail('test@example.com');
      
      expect(db.querySingle).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['test@example.com']
      );
      
      expect(user).toBeDefined();
      expect(user?.email).toBe('test@example.com');
    });
    
    it('should create a new user', async () => {
      const userData = {
        email: 'new@example.com',
        name: 'New User',
        password: 'hashedpassword'
      };
      
      const mockUser = {
        id: '123',
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (db.querySingle as jest.Mock).mockResolvedValue(mockUser);
      
      const newUser = await userRepository.create(userData);
      
      expect(db.querySingle).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO users'),
        expect.arrayContaining([userData.email, userData.name, userData.password])
      );
      
      expect(newUser).toBeDefined();
      expect(newUser.email).toBe('new@example.com');
    });
  });
  
  describe('Product Repository', () => {
    it('should find multiple products', async () => {
      const mockProducts = [{
        id: '456',
        name: 'Test Product',
        description: 'Test Description',
        basePrice: 19.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }];
      
      (db.query as jest.Mock).mockResolvedValue({ rows: mockProducts });
      
      const products = await productRepository.findMany();
      
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        expect.arrayContaining([true, 10, 0])
      );
      
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('Test Product');
    });
    
    it('should find product by id', async () => {
      const mockProduct = {
        id: '456',
        name: 'Test Product',
        description: 'Test Description',
        basePrice: 19.99,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      (db.querySingle as jest.Mock).mockResolvedValue(mockProduct);
      
      const product = await productRepository.findById('456');
      
      expect(db.querySingle).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['456']
      );
      
      expect(product).toBeDefined();
      expect(product?.name).toBe('Test Product');
    });
  });
  
  describe('Transaction Support', () => {
    it('should support database transactions', async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: '789' }] }),
        release: jest.fn()
      };
      
      const mockCallback = jest.fn().mockResolvedValue({ success: true });
      
      (db.transaction as jest.Mock).mockImplementation(async (callback) => {
        return await callback(mockClient);
      });
      
      const result = await db.transaction(mockCallback);
      
      expect(db.transaction).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith(mockClient);
      expect(result).toEqual({ success: true });
    });
  });
});

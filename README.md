# AI T-Shirt Designer - LLM E-commerce

An e-commerce platform focused on AI-generated t-shirt designs. Users can create custom t-shirt designs using AI, browse existing designs, and make purchases.

## Features

- **Home** – Landing page with featured AI-generated t-shirts and CTA to start designing
- **Shop** – Browse AI-generated t-shirts available for purchase
- **My Designs** – View saved designs and previous AI-generated artwork
- **Cart** – View selected items before checkout
- **Orders** – Track past and current orders
- **Profile** – User account settings, including name, email, and saved designs
- **Help & FAQs** – Support section for common queries
- **API System** - RESTful API endpoints for authentication, products, and orders
- **Database** - PostgreSQL with Prisma ORM for data storage
- **Image Storage** - AWS S3 integration for design and product images

## Technologies Used

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- AWS S3 for image storage

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- (Optional) AWS account with S3 bucket

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/llm-ecommerce.git
cd llm-ecommerce
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your database connection string and other settings.

4. Setup the database:
```bash
# Generate Prisma client
npm run prisma:generate

# Create and apply migrations
npm run prisma:migrate:dev

# Seed the database
npm run prisma:seed
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable UI components
  - `navigation/` - Navigation-related components
  - `layout/` - Layout components
  - `design/` - T-shirt design components
- `src/lib/` - Utility functions and services
  - `api/` - API utilities and validation
  - `auth/` - Authentication utilities
  - `db/` - Database client and utilities
  - `storage/` - S3 storage utilities
- `prisma/` - Prisma schema and migrations
- `public/` - Static assets

## API Endpoints

The application provides the following API endpoints:

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/me` - Get the current user's profile

### Products

- `GET /api/products` - Get all products (with filtering and pagination)
- `POST /api/products` - Create a new product (admin only)
- `GET /api/products/:id` - Get a specific product
- `PUT /api/products/:id` - Update a product (admin only)
- `DELETE /api/products/:id` - Delete/deactivate a product (admin only)

### Product Images

- `GET /api/products/:id/images` - Get all images for a product
- `POST /api/products/:id/images` - Upload an image to a product (admin only)
- `GET /api/products/:id/images/:imageId` - Get a specific image
- `PUT /api/products/:id/images/:imageId` - Update image metadata (admin only)
- `DELETE /api/products/:id/images/:imageId` - Delete an image (admin only)

### Orders

- `GET /api/orders` - Get all orders for the current user
- `POST /api/orders` - Create a new order
- `GET /api/orders/:id` - Get a specific order
- `PUT /api/orders/:id` - Update an order (e.g., cancel it)

### Designs

- `GET /api/designs` - Get all designs for the current user
- `POST /api/designs` - Save a new design

## Testing

Run the test suite with:

```bash
npm run test
```

## Demo Users

The seed script creates two demo users:

- Email: john@example.com / Password: password123
- Email: jane@example.com / Password: password123

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request
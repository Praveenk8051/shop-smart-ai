import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db/prisma';
import { hashPassword, generateToken } from '@/lib/auth/server/auth';
import { createApiResponse, validateForm } from '@/lib/api/validation';

// Address validation schema
const addressValidationSchema = {
  street: { required: true, minLength: 2, maxLength: 100 },
  city: { required: true, minLength: 2, maxLength: 50 },
  state: { required: true, minLength: 2, maxLength: 50 },
  postalCode: { required: true, minLength: 2, maxLength: 20 },
  country: { required: true, minLength: 2, maxLength: 50 },
};

// Validate a single address
const validateAddress = (address: any, prefix: string) => {
  const errors: Record<string, string> = {};
  
  for (const field in addressValidationSchema) {
    const rules = addressValidationSchema[field as keyof typeof addressValidationSchema];
    const value = address?.[field];
    const error = validateForm({ [field]: value }, { [field]: rules })[field];
    if (error) {
      errors[`${prefix}.${field}`] = error;
    }
  }
  
  return errors;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate basic user information
    const userErrors = validateForm(body, {
      name: { required: true, minLength: 2, maxLength: 50 },
      email: { required: true, isEmail: true },
      password: { required: true, minLength: 8 },
      phone: { required: true, minLength: 5, maxLength: 20 },
    });

    // Validate delivery address
    const deliveryAddressErrors = validateAddress(body.deliveryAddress, 'deliveryAddress');
    
    // Validate billing address if provided
    let billingAddressErrors: Record<string, string> = {};
    if (body.billingAddress) {
      billingAddressErrors = validateAddress(body.billingAddress, 'billingAddress');
    }
    
    // Combine all errors
    const errors = {
      ...userErrors,
      ...deliveryAddressErrors,
      ...billingAddressErrors,
    };

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Validation error', 400, errors)
      );
    }

    const { name, email, password, phone, deliveryAddress, billingAddress } = body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Email already in use', 409)
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user with addresses in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the user
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      
      // Add delivery address
      const newDeliveryAddress = await tx.address.create({
        data: {
          userId: newUser.id,
          street: deliveryAddress.street,
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          postalCode: deliveryAddress.postalCode,
          country: deliveryAddress.country,
          phone: phone,
          isDefault: true, // Set as default
        },
      });
      
      // Add billing address if different from delivery
      if (billingAddress && billingAddress !== deliveryAddress) {
        await tx.address.create({
          data: {
            userId: newUser.id,
            street: billingAddress.street,
            city: billingAddress.city,
            state: billingAddress.state,
            postalCode: billingAddress.postalCode,
            country: billingAddress.country,
            phone: phone,
            isDefault: false,
          },
        });
      }
      
      return newUser;
    });

    // Generate token for automatic login
    const token = generateToken({
      userId: result.id,
      email: result.email,
    });

    return NextResponse.json(
      createApiResponse(
        true, 
        { 
          user: result,
          token
        }, 
        undefined, 
        201
      )
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}
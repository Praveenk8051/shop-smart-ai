import { NextRequest, NextResponse } from 'next/server';
import { generateToken, verifyToken } from '@/lib/auth/server/auth';
import prisma from '@/lib/db/prisma';
import { createApiResponse } from '@/lib/api/validation';

// For sending verification emails
// This is just a placeholder - in a real app, you would use a proper email service
const sendVerificationEmail = async (email: string, token: string) => {
  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
  
  console.log(`Sending verification email to ${email} with link: ${verificationLink}`);
  
  // In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
  // Example with SendGrid would be:
  // await sendgrid.send({
  //   to: email,
  //   from: 'noreply@yourdomain.com',
  //   subject: 'Verify your email address',
  //   text: `Please verify your email by clicking this link: ${verificationLink}`,
  //   html: `<p>Please verify your email by clicking this link: <a href="${verificationLink}">Verify Email</a></p>`,
  // });
  
  return true;
};

// API route to request email verification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        createApiResponse(false, undefined, 'Email is required', 400)
      );
    }
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security reasons
      return NextResponse.json(
        createApiResponse(true, { message: 'If your email is registered, you will receive a verification link shortly' })
      );
    }
    
    // Generate a verification token
    const verificationToken = generateToken({
      userId: user.id,
      email: user.email,
      purpose: 'email_verification'
    });
    
    // Send verification email
    await sendVerificationEmail(email, verificationToken);
    
    return NextResponse.json(
      createApiResponse(true, { message: 'Verification email sent' })
    );
  } catch (error) {
    console.error('Email verification request error:', error);
    return NextResponse.json(
      createApiResponse(false, undefined, 'Server error', 500)
    );
  }
}

// API route to verify email with token
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    
    if (!token) {
      return NextResponse.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=invalid_verification_link`
      );
    }
    
    // Verify the token
    const payload = verifyToken(token);
    
    if (!payload || payload.purpose !== 'email_verification') {
      return NextResponse.redirect(
        `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=invalid_verification_token`
      );
    }
    
    // Update user as verified
    await prisma.user.update({
      where: { id: payload.userId },
      data: { 
        // In a real implementation, you would add a 'emailVerified: true' field to your User model
        // This is just a placeholder for now
        updatedAt: new Date() 
      },
    });
    
    // Redirect to login page with success message
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?email_verified=true`
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth?error=verification_failed`
    );
  }
}
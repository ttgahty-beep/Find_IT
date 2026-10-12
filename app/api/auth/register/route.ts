import { NextRequest, NextResponse } from 'next/server';
import { validateRegisterInput } from '@/lib/validation';
import { campusStore } from '@/lib/store';
import { generateSecureToken } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateRegisterInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed. Please correct highlighted fields.',
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const { name, email, role, studentId, phone, password } = validation.sanitizedData;

    // Check existing email
    const existing = campusStore.findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: 'An account with this campus email already exists.',
          errors: { email: 'Email is already registered. Please sign in instead.' },
        },
        { status: 409 }
      );
    }

    // Create user in store (hashes password with PBKDF2-HMAC-SHA512 + encrypts studentId/phone with AES-256-GCM)
    const newUser = campusStore.createUser({
      name,
      email,
      role,
      studentId,
      phone,
      passwordPlain: password,
    });

    const sessionToken = generateSecureToken(32);

    // Return safe user object (excluding password hash, salt)
    return NextResponse.json(
      {
        success: true,
        message: 'Account registered successfully. Welcome to FindIt Campus!',
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          studentIdMasked: newUser.studentIdMasked,
          createdAt: newUser.createdAt,
          encryptionInfo: {
            algorithm: 'AES-256-GCM',
            authTagVerified: true,
            passwordHashAlgo: 'PBKDF2-HMAC-SHA512 (100,000 iterations)',
          },
        },
        sessionToken,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal error occurred during registration. Please try again.',
      },
      { status: 500 }
    );
  }
}

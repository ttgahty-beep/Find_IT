import { NextRequest, NextResponse } from 'next/server';
import { validateLoginInput } from '@/lib/validation';
import { campusStore } from '@/lib/store';
import { verifyPassword, generateSecureToken } from '@/lib/crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = validateLoginInput(body);

    if (!validation.isValid || !validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid credentials or missing required fields.',
          errors: validation.errors,
        },
        { status: 422 }
      );
    }

    const { email, password } = validation.sanitizedData;

    // Lookup user
    const user = campusStore.findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password combination.',
          errors: { email: 'Account not found with this campus address.' },
        },
        { status: 401 }
      );
    }

    // Verify password with timing-safe PBKDF2 check
    const isValidPassword = verifyPassword(
      password,
      user.passwordHash,
      user.passwordSalt,
      user.passwordIterations
    );

    if (!isValidPassword) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email or password combination.',
          errors: { password: 'The password provided is incorrect.' },
        },
        { status: 401 }
      );
    }

    const sessionToken = generateSecureToken(32);

    return NextResponse.json(
      {
        success: true,
        message: 'Signed in successfully.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentIdMasked: user.studentIdMasked,
          avatarUrl: user.avatarUrl,
        },
        sessionToken,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An internal error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}

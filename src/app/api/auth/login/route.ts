import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { AUTH_COOKIE, TOKEN_TTL_SECONDS, signAuthToken } from '@/lib/jwt';
import { asString, errorResponse, normalizeEmail } from '@/lib/http';
import { limitByIp, rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const limited = limitByIp(req, 'login', 20, 15 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const email = normalizeEmail(body.email);
    const password = asString(body.password, 200);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Please provide email and password' },
        { status: 400 }
      );
    }

    // Per-account throttle against password guessing spread across IPs
    if (!rateLimit(`login-account:${email}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json(
        { message: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email }).select('+password');

    // OAuth-only accounts have no password
    const isMatch = user?.password ? await bcrypt.compare(password, user.password) : false;

    if (!user || !isMatch) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      { message: 'Login successful', user: { id: user._id, name: user.name, email: user.email, role: user.role || 'user' } },
      { status: 200 }
    );

    response.cookies.set({
      name: AUTH_COOKIE,
      value: signAuthToken(user._id.toString()),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: TOKEN_TTL_SECONDS,
      path: '/',
    });

    return response;
  } catch (error) {
    return errorResponse(error, 'Login failed. Please try again later.');
  }
}

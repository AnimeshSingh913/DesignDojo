import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { asString, errorResponse, normalizeEmail } from '@/lib/http';
import { limitByIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const limited = limitByIp(req, 'signup', 10, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const name = asString(body.name, 100);
    const email = normalizeEmail(body.email);
    const password = typeof body.password === 'string' ? body.password : '';

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Please provide a name, a valid email and a password' },
        { status: 400 }
      );
    }

    if (password.length < 8 || password.length > 200) {
      return NextResponse.json(
        { message: 'Password must be between 8 and 200 characters' },
        { status: 400 }
      );
    }

    await dbConnect();
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    return errorResponse(error, 'Sign up failed. Please try again later.');
  }
}

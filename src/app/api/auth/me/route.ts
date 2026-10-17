import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth-check';

// Works for both email/password (JWT cookie) and OAuth (NextAuth session) users.
export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json(
        { user: null, message: 'Not authenticated' },
        { status: 200 }
      );
    }

    await dbConnect();
    const user = await User.findById(authUser.id);

    if (!user) {
      return NextResponse.json(
        { user: null, message: 'User not found' },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role || 'user',
          customLimits: user.customLimits,
          aiUsage: user.aiUsage
        }
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { user: null, message: 'Not authenticated' },
      { status: 200 }
    );
  }
}

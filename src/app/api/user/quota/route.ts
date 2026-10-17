import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-check';
import { getUserQuotaSummary } from '@/lib/quota';

export async function GET(req: Request) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const quota = await getUserQuotaSummary(authUser.id);
    if (!quota) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ quota }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to fetch quota' },
      { status: 500 }
    );
  }
}

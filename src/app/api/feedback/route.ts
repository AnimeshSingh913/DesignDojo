import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import { getAuthUser } from '@/lib/auth-check';
import { errorResponse } from '@/lib/http';
import { limitByIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const limited = limitByIp(req, 'feedback', 5, 60 * 60 * 1000);
    if (limited) return limited;

    const body = await req.json().catch(() => ({}));
    const rating = Number(body.rating);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Valid rating between 1 and 5 is required' }, { status: 400 });
    }
    const comment = typeof body.comment === 'string' ? body.comment.trim().slice(0, 2000) : '';

    const authUser = await getAuthUser(req);

    await dbConnect();
    await Feedback.create({
      rating,
      comment,
      userEmail: authUser?.email,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    return errorResponse(error, 'Internal Server Error', 'error');
  }
}

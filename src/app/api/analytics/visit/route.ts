import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-check';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { visitorId, path, referrer } = body;

    if (!visitorId || !path) {
      return NextResponse.json({ message: 'visitorId and path are required' }, { status: 400 });
    }

    if (!process.env.MONGODB_URI) {
      // Return 200 gracefully if DB is not configured in local development
      return NextResponse.json({ success: true, tracking: 'mock' }, { status: 200 });
    }

    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
    const userAgent = req.headers.get('user-agent') || '';

    const sanitizedVisitorId = String(visitorId).slice(0, 100);
    const sanitizedPath = String(path).slice(0, 255);
    const sanitizedReferrer = String(referrer || '').slice(0, 500);
    const sanitizedUserAgent = String(userAgent).slice(0, 500);
    const sanitizedIp = String(ip).slice(0, 100);

    // Check optional authenticated user
    const authUser = await getAuthUser(req).catch(() => null);

    try {
      const dbConnect = (await import('@/lib/db')).default;
      const VisitorLog = (await import('@/models/VisitorLog')).default;

      await dbConnect();

      // Check if same visitor on same path in last 3 minutes (avoid spamming DB on rapid reloads)
      const recentThreshold = new Date(Date.now() - 3 * 60 * 1000);
      const existingRecent = await VisitorLog.findOne({
        visitorId: sanitizedVisitorId,
        path: sanitizedPath,
        createdAt: { $gte: recentThreshold },
      });

      if (!existingRecent) {
        await VisitorLog.create({
          visitorId: sanitizedVisitorId,
          ip: sanitizedIp,
          userAgent: sanitizedUserAgent,
          path: sanitizedPath,
          referrer: sanitizedReferrer,
          userId: authUser ? authUser.id : null,
        });
      }
    } catch (dbErr: any) {
      // Telemetry errors should not fail with 500
      return NextResponse.json({ success: false, reason: 'db_unavailable' }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error?.message || 'Error logging visit' }, { status: 200 });
  }
}

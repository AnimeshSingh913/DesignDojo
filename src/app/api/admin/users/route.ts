import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';
import { requireAdmin } from '@/lib/auth-check';
import { errorResponse } from '@/lib/http';

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const LIMIT_KEYS = ['lldReview', 'lldChat', 'hldReview', 'hldChat', 'aiGenerator', 'mentorChat'] as const;

/** Empty/invalid input clears the override (null = use global limit). */
function parseLimit(value: unknown): number | null {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(String(value), 10);
  return Number.isFinite(n) ? Math.min(Math.max(0, n), 100000) : null;
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('q') || '').trim().slice(0, 100);

    await dbConnect();

    const query: any = {};
    if (search) {
      const pattern = escapeRegex(search);
      query.$or = [
        { name: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('name email role customLimits aiUsage createdAt updatedAt')
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return errorResponse(error, 'Server error');
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const { action, userId, customLimits, role } = await req.json();

    if (!action) {
      return NextResponse.json({ message: 'Action is required' }, { status: 400 });
    }

    if (userId !== 'all' && userId !== undefined && !mongoose.isValidObjectId(userId)) {
      return NextResponse.json({ message: 'Invalid user ID' }, { status: 400 });
    }

    await dbConnect();

    // 1. Reset usage counter
    if (action === 'reset_usage') {
      if (userId === 'all') {
        await User.updateMany({}, {
          $set: {
            'aiUsage.lldReview': 0,
            'aiUsage.lldChat': 0,
            'aiUsage.hldReview': 0,
            'aiUsage.hldChat': 0,
            'aiUsage.aiGenerator': 0,
            'aiUsage.mentorChat': 0,
            'aiUsage.totalCalls': 0,
          }
        });
        return NextResponse.json({ message: 'Reset AI usage for all users successfully.' });
      }

      if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      user.aiUsage = {
        lldReview: 0,
        lldChat: 0,
        hldReview: 0,
        hldChat: 0,
        aiGenerator: 0,
        mentorChat: 0,
        totalCalls: 0,
        lastUsedAt: null,
      };
      await user.save();

      return NextResponse.json({ message: `Reset AI usage for ${user.email} successfully.`, user });
    }

    // 2. Update custom limits
    if (action === 'update_limit') {
      if (!userId) {
        return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      user.customLimits = Object.fromEntries(
        LIMIT_KEYS.map((key) => [key, parseLimit(customLimits?.[key])])
      );

      await user.save();
      return NextResponse.json({ message: `Custom limits updated for ${user.email}`, user });
    }

    // 3. Change role
    if (action === 'change_role') {
      if (!userId || !role || !['user', 'admin'].includes(role)) {
        return NextResponse.json({ message: 'Valid userId and role are required' }, { status: 400 });
      }

      if (userId === admin.id && role !== 'admin') {
        return NextResponse.json({ message: 'You cannot remove your own admin role.' }, { status: 400 });
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }

      user.role = role;
      await user.save();

      return NextResponse.json({ message: `Role changed to ${role} for ${user.email}`, user });
    }

    return NextResponse.json({ message: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return errorResponse(error, 'Server error');
  }
}

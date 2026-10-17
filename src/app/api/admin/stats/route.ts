import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VisitorLog from '@/models/VisitorLog';
import User from '@/models/User';
import SystemSetting, { DEFAULT_AI_LIMITS } from '@/models/SystemSetting';
import { requireAdmin } from '@/lib/auth-check';

export async function GET(req: Request) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) {
      return NextResponse.json({ message: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    await dbConnect();

    // 1. Visitor Analytics
    const totalVisits = await VisitorLog.countDocuments();
    const uniqueVisitorsResult = await VisitorLog.distinct('visitorId');
    const uniqueVisitors = uniqueVisitorsResult.length;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayVisits = await VisitorLog.countDocuments({ createdAt: { $gte: startOfToday } });

    // 7 Days Trend
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyLogs = await VisitorLog.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          visits: { $sum: 1 },
          uniqueVisitors: { $addToSet: '$visitorId' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const trend = dailyLogs.map(item => ({
      date: item._id,
      visits: item.visits,
      uniqueVisitors: item.uniqueVisitors.length
    }));

    // Top Pages
    const topPages = await VisitorLog.aggregate([
      {
        $group: {
          _id: '$path',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]).then(res => res.map(r => ({ path: r._id, count: r.count })));

    // Recent 12 Visitor Logs
    const recentLogs = await VisitorLog.find()
      .sort({ createdAt: -1 })
      .limit(12)
      .lean();

    // 2. User & AI Usage Aggregates
    const totalUsers = await User.countDocuments();
    const activeUsersResult = await User.aggregate([
      {
        $group: {
          _id: null,
          totalCalls: { $sum: '$aiUsage.totalCalls' },
          totalLLDReviews: { $sum: '$aiUsage.lldReview' },
          totalLLDChats: { $sum: '$aiUsage.lldChat' },
          totalHLDReviews: { $sum: '$aiUsage.hldReview' },
          totalHLDChats: { $sum: '$aiUsage.hldChat' },
          totalAIGenerations: { $sum: '$aiUsage.aiGenerator' },
          totalMentorChats: { $sum: '$aiUsage.mentorChat' },
        }
      }
    ]);

    const aiMetrics = activeUsersResult[0] || {
      totalCalls: 0,
      totalLLDReviews: 0,
      totalLLDChats: 0,
      totalHLDReviews: 0,
      totalHLDChats: 0,
      totalAIGenerations: 0,
      totalMentorChats: 0,
    };

    // Global Limits
    const setting = await SystemSetting.findOne({ key: 'global_ai_limits' });
    const globalLimits = setting?.limits || DEFAULT_AI_LIMITS;

    return NextResponse.json({
      visitorStats: {
        totalVisits,
        uniqueVisitors,
        todayVisits,
        trend,
        topPages,
        recentLogs,
      },
      userStats: {
        totalUsers,
        aiMetrics,
      },
      globalLimits,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

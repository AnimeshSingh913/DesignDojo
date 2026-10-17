'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  Users,
  Eye,
  Sparkles,
  GitMerge,
  Component,
  Bot,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Search,
  Sliders,
  TrendingUp,
  Activity,
  UserCheck,
  Edit2,
  X,
  Plus,
  Minus,
  Globe,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  Lock
} from 'lucide-react';
import Link from 'next/link';

interface IAILimitsState {
  lldReview: number;
  lldChat: number;
  hldReview: number;
  hldChat: number;
  aiGenerator: number;
  mentorChat: number;
}

interface IUserItem {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: string;
  aiUsage?: {
    lldReview?: number;
    lldChat?: number;
    hldReview?: number;
    hldChat?: number;
    aiGenerator?: number;
    mentorChat?: number;
    totalCalls?: number;
    lastUsedAt?: string;
  };
  customLimits?: {
    lldReview?: number | null;
    lldChat?: number | null;
    hldReview?: number | null;
    hldChat?: number | null;
    aiGenerator?: number | null;
    mentorChat?: number | null;
  };
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'limits' | 'users' | 'activity'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Stats state
  const [stats, setStats] = useState<any>(null);
  const [limits, setLimits] = useState<IAILimitsState>({
    lldReview: 3,
    lldChat: 5,
    hldReview: 3,
    hldChat: 5,
    aiGenerator: 5,
    mentorChat: 10,
  });

  // User state
  const [users, setUsers] = useState<IUserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingLimits, setSavingLimits] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // User Edit Modal State
  const [editingUser, setEditingUser] = useState<IUserItem | null>(null);
  const [userCustomLimits, setUserCustomLimits] = useState<any>({});
  const [savingUserLimit, setSavingUserLimit] = useState(false);

  const fetchAdminData = async () => {
    try {
      setRefreshing(true);
      const [statsRes, limitsRes, usersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/limits'),
        fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      if (limitsRes.ok) {
        const limitsData = await limitsRes.json();
        if (limitsData.limits) {
          setLimits(limitsData.limits);
        }
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users || []);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  // Debounced user search
  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const timer = setTimeout(() => {
      fetch(`/api/admin/users?q=${encodeURIComponent(searchQuery)}`)
        .then(res => res.json())
        .then(data => setUsers(data.users || []))
        .catch(() => {});
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ type, text });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  const handleSaveGlobalLimits = async () => {
    setSavingLimits(true);
    try {
      const res = await fetch('/api/admin/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limits }),
      });

      const data = await res.json();
      if (res.ok) {
        showNotification('Global AI limits saved and applied to all users successfully!');
        if (data.limits) setLimits(data.limits);
      } else {
        showNotification(data.message || 'Failed to save limits', 'error');
      }
    } catch {
      showNotification('Network error while saving limits', 'error');
    } finally {
      setSavingLimits(false);
    }
  };

  const handleResetToDefaults = () => {
    setLimits({
      lldReview: 3,
      lldChat: 5,
      hldReview: 3,
      hldChat: 5,
      aiGenerator: 5,
      mentorChat: 10,
    });
    showNotification('Reset to recommended defaults. Click "Save Changes" to apply.');
  };

  const handleDoubleLimits = () => {
    setLimits(prev => ({
      lldReview: prev.lldReview * 2,
      lldChat: prev.lldChat * 2,
      hldReview: prev.hldReview * 2,
      hldChat: prev.hldChat * 2,
      aiGenerator: prev.aiGenerator * 2,
      mentorChat: prev.mentorChat * 2,
    }));
    showNotification('All limits doubled! Click "Save Changes" to apply.');
  };

  const handleResetUserUsage = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to reset AI usage counter for ${userEmail}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_usage', userId }),
      });

      if (res.ok) {
        showNotification(`Usage reset for ${userEmail}`);
        fetchAdminData();
      } else {
        showNotification('Failed to reset usage', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    }
  };

  const handleResetAllUsersUsage = async () => {
    if (!confirm('Are you sure you want to reset AI usage for ALL registered users?')) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_usage', userId: 'all' }),
      });

      if (res.ok) {
        showNotification('All users AI usage reset to 0');
        fetchAdminData();
      } else {
        showNotification('Failed to reset all users', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    }
  };

  const openUserEditModal = (targetUser: IUserItem) => {
    setEditingUser(targetUser);
    setUserCustomLimits({
      lldReview: targetUser.customLimits?.lldReview ?? '',
      lldChat: targetUser.customLimits?.lldChat ?? '',
      hldReview: targetUser.customLimits?.hldReview ?? '',
      hldChat: targetUser.customLimits?.hldChat ?? '',
      aiGenerator: targetUser.customLimits?.aiGenerator ?? '',
      mentorChat: targetUser.customLimits?.mentorChat ?? '',
    });
  };

  const handleSaveUserCustomLimits = async () => {
    if (!editingUser) return;
    setSavingUserLimit(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_limit',
          userId: editingUser._id,
          customLimits: userCustomLimits,
        }),
      });

      if (res.ok) {
        showNotification(`Custom limits updated for ${editingUser.email}`);
        setEditingUser(null);
        fetchAdminData();
      } else {
        showNotification('Failed to update user limits', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    } finally {
      setSavingUserLimit(false);
    }
  };

  const handleToggleRole = async (targetUser: IUserItem) => {
    const nextRole = targetUser.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change role of ${targetUser.email} to ${nextRole}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change_role',
          userId: targetUser._id,
          role: nextRole,
        }),
      });

      if (res.ok) {
        showNotification(`Role updated to ${nextRole}`);
        fetchAdminData();
      } else {
        showNotification('Failed to change role', 'error');
      }
    } catch {
      showNotification('Network error', 'error');
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authorized
  if (!user || user.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-surface rounded-2xl border border-primary/15 text-center shadow-soft">
        <div className="w-14 h-14 bg-warn/10 text-warn rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-2xl font-bold font-heading text-primary-ink mb-2">Admin Access Required</h2>
        <p className="text-sm text-primary/70 mb-6 leading-relaxed">
          You must be signed in with an administrator account (configured via <code className="bg-primary/10 px-1.5 py-0.5 rounded text-xs font-code">ADMIN_EMAIL</code>) to view the management dashboard.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-surface font-semibold text-sm rounded-xl hover:bg-primary-ink transition-colors"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 max-w-[1200px] mx-auto">
      {/* Toast Notification */}
      <AnimatePresence>
        {feedbackMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lift border text-sm font-semibold ${
              feedbackMsg.type === 'success'
                ? 'bg-surface text-primary-ink border-accent-deep/50'
                : 'bg-warn/10 text-warn border-warn/30'
            }`}
          >
            {feedbackMsg.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-accent-deep" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-warn" />
            )}
            {feedbackMsg.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <section className="relative overflow-hidden rounded-[20px] bg-surface border border-primary/10 p-6 sm:p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-accent/15 to-transparent pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary text-surface text-[11px] font-bold rounded-full uppercase tracking-wider">
              <ShieldCheck size={13} /> Admin Command Center
            </span>
            <span className="text-xs font-code text-primary/60">
              {user?.email}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-[28px] sm:text-[32px] text-primary-ink tracking-tight">
            System & Rate Limit Control
          </h1>
          <p className="text-[14px] text-primary/70 font-medium mt-1">
            Real-time visitor monitoring, dynamic AI feature limits, and registered user quotas.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchAdminData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-bg hover:bg-primary/5 border border-primary/15 text-primary text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh Data
          </button>
        </div>
      </section>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-primary/10 pb-3">
        {[
          { id: 'overview', label: 'Visitor Analytics & Overview', icon: TrendingUp },
          { id: 'limits', label: 'AI Rate Limits Config', icon: Sliders },
          { id: 'users', label: `Users & Usage (${users.length})`, icon: Users },
          { id: 'activity', label: 'Live Visitor Logs', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl font-heading text-sm font-bold transition-all ${
                isActive
                  ? 'bg-primary text-surface shadow-[0_2px_8px_rgba(53,66,89,0.2)]'
                  : 'bg-surface text-primary/70 hover:text-primary hover:bg-surface/80 border border-primary/5'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & VISITOR ANALYTICS */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Visits */}
            <div className="bg-surface p-5 rounded-2xl border border-primary/10 shadow-soft relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Total Site Visits</span>
                <div className="w-8 h-8 rounded-xl bg-accent/30 text-primary flex items-center justify-center">
                  <Eye size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-heading text-primary-ink">
                {stats?.visitorStats?.totalVisits ?? '...'}
              </div>
              <p className="text-xs text-primary/60 mt-1">Total page impressions logged</p>
            </div>

            {/* Unique Visitors */}
            <div className="bg-surface p-5 rounded-2xl border border-primary/10 shadow-soft relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Unique Visitors</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Globe size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-heading text-primary-ink">
                {stats?.visitorStats?.uniqueVisitors ?? '...'}
              </div>
              <p className="text-xs text-primary/60 mt-1">Distinct device / visitor IDs</p>
            </div>

            {/* Today's Visits */}
            <div className="bg-surface p-5 rounded-2xl border border-primary/10 shadow-soft relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Today's Visits</span>
                <div className="w-8 h-8 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <TrendingUp size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-heading text-primary-ink">
                {stats?.visitorStats?.todayVisits ?? '...'}
              </div>
              <p className="text-xs text-primary/60 mt-1">Active visits since midnight</p>
            </div>

            {/* Total Registered Users */}
            <div className="bg-surface p-5 rounded-2xl border border-primary/10 shadow-soft relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">Registered Users</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Users size={16} />
                </div>
              </div>
              <div className="text-3xl font-extrabold font-heading text-primary-ink">
                {stats?.userStats?.totalUsers ?? '...'}
              </div>
              <p className="text-xs text-primary/60 mt-1">Accounts in database</p>
            </div>
          </div>

          {/* AI Usage Breakdown Metrics */}
          <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-soft">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-primary/10">
              <div>
                <h3 className="text-lg font-bold font-heading text-primary-ink">AI Feature Usage Aggregates</h3>
                <p className="text-xs text-primary/60">Total AI invocations consumed across all users</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-xl border border-primary/10 text-xs font-bold text-primary">
                <Sparkles size={14} />
                Total AI Calls: {stats?.userStats?.aiMetrics?.totalCalls ?? 0}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: 'LLD Reviews', count: stats?.userStats?.aiMetrics?.totalLLDReviews ?? 0, icon: GitMerge, color: 'text-green-700', bg: 'bg-green-100' },
                { label: 'LLD Chats', count: stats?.userStats?.aiMetrics?.totalLLDChats ?? 0, icon: GitMerge, color: 'text-emerald-700', bg: 'bg-emerald-100' },
                { label: 'HLD Reviews', count: stats?.userStats?.aiMetrics?.totalHLDReviews ?? 0, icon: Component, color: 'text-blue-700', bg: 'bg-blue-100' },
                { label: 'HLD Chats', count: stats?.userStats?.aiMetrics?.totalHLDChats ?? 0, icon: Component, color: 'text-indigo-700', bg: 'bg-indigo-100' },
                { label: 'AI Gen Runs', count: stats?.userStats?.aiMetrics?.totalAIGenerations ?? 0, icon: Sparkles, color: 'text-purple-700', bg: 'bg-purple-100' },
                { label: 'Mentor Chats', count: stats?.userStats?.aiMetrics?.totalMentorChats ?? 0, icon: Bot, color: 'text-amber-700', bg: 'bg-amber-100' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="p-3.5 rounded-xl bg-bg/50 border border-primary/5 flex flex-col items-center text-center">
                    <div className={`w-8 h-8 rounded-lg ${item.bg} ${item.color} flex items-center justify-center mb-2`}>
                      <Icon size={16} />
                    </div>
                    <div className="text-xl font-bold font-heading text-primary-ink">{item.count}</div>
                    <div className="text-[11px] font-semibold text-primary/70">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 7-Day Trend and Top Pages */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7 Days Trend */}
            <div className="lg:col-span-2 bg-surface p-6 rounded-2xl border border-primary/10 shadow-soft">
              <h3 className="text-base font-bold font-heading text-primary-ink mb-1">7-Day Visitor Trend</h3>
              <p className="text-xs text-primary/60 mb-6">Daily page visits and unique users</p>

              {stats?.visitorStats?.trend && stats.visitorStats.trend.length > 0 ? (
                <div className="flex items-end justify-between gap-3 h-44 pt-6 pb-2">
                  {stats.visitorStats.trend.map((day: any) => {
                    const maxVal = Math.max(...stats.visitorStats.trend.map((t: any) => t.visits || 1), 1);
                    const heightPercent = Math.max(12, Math.round((day.visits / maxVal) * 100));
                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] font-bold text-primary/60 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                          {day.visits}v ({day.uniqueVisitors}u)
                        </div>
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className="w-full max-w-[36px] bg-primary group-hover:bg-primary-ink rounded-t-lg transition-all relative"
                        >
                          <div
                            style={{ height: `${Math.max(10, Math.round((day.uniqueVisitors / (day.visits || 1)) * 100))}%` }}
                            className="absolute bottom-0 inset-x-0 bg-accent-deep/60 rounded-t-sm"
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-primary/60 mt-2 truncate max-w-full">
                          {day.date.substring(5)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center text-sm text-primary/50">No visit activity logged yet today.</div>
              )}
            </div>

            {/* Top Visited Pages */}
            <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-soft">
              <h3 className="text-base font-bold font-heading text-primary-ink mb-1">Top Visited Pages</h3>
              <p className="text-xs text-primary/60 mb-4">Most popular routes visited</p>

              <div className="space-y-2.5">
                {stats?.visitorStats?.topPages && stats.visitorStats.topPages.length > 0 ? (
                  stats.visitorStats.topPages.map((page: any, idx: number) => (
                    <div key={page.path} className="flex items-center justify-between text-xs py-1.5 border-b border-primary/5 last:border-0">
                      <div className="flex items-center gap-2 truncate pr-2">
                        <span className="w-5 h-5 rounded-md bg-primary/5 flex items-center justify-center font-bold text-[10px] text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-code text-primary-ink truncate" title={page.path}>
                          {page.path}
                        </span>
                      </div>
                      <span className="font-bold text-primary shrink-0 bg-primary/10 px-2 py-0.5 rounded-full">
                        {page.count} visits
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-primary/50">Tracking traffic...</div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 2: AI RATE LIMITS CONFIG */}
      {activeTab === 'limits' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-surface p-6 sm:p-8 rounded-2xl border border-primary/10 shadow-soft">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-primary/10">
              <div>
                <h3 className="text-xl font-bold font-heading text-primary-ink">Global AI Usage Rate Limits</h3>
                <p className="text-xs sm:text-sm text-primary/70 mt-0.5">
                  Configure the maximum free uses granted to every user for each AI feature.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleResetToDefaults}
                  className="cursor-pointer px-3.5 py-2 text-xs font-bold text-primary/80 hover:text-primary-ink bg-bg rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors"
                >
                  Reset Defaults
                </button>
                <button
                  type="button"
                  onClick={handleDoubleLimits}
                  className="cursor-pointer px-3.5 py-2 text-xs font-bold text-primary/80 hover:text-primary-ink bg-bg rounded-xl border border-primary/10 hover:bg-primary/5 transition-colors"
                >
                  +100% (Double All)
                </button>
                <button
                  type="button"
                  onClick={handleSaveGlobalLimits}
                  disabled={savingLimits}
                  className="cursor-pointer inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-surface bg-primary hover:bg-primary-ink rounded-xl shadow-md transition-all disabled:opacity-60"
                >
                  <Save size={14} />
                  {savingLimits ? 'Saving...' : 'Save Global Limits'}
                </button>
              </div>
            </div>

            {/* 6 Feature Limit Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
              {[
                {
                  key: 'lldReview' as const,
                  title: 'LLD Design Review',
                  desc: 'Validate & evaluate object-oriented class UML diagrams.',
                  defaultVal: 3,
                  icon: GitMerge,
                  color: 'text-green-700 bg-green-100',
                },
                {
                  key: 'lldChat' as const,
                  title: 'LLD Discussion / Chat',
                  desc: 'Interactive chat & questions about LLD designs.',
                  defaultVal: 5,
                  icon: GitMerge,
                  color: 'text-emerald-700 bg-emerald-100',
                },
                {
                  key: 'hldReview' as const,
                  title: 'HLD Architecture Review',
                  desc: 'Evaluate cloud & distributed system designs against requirements.',
                  defaultVal: 3,
                  icon: Component,
                  color: 'text-blue-700 bg-blue-100',
                },
                {
                  key: 'hldChat' as const,
                  title: 'HLD Discussion / Chat',
                  desc: 'Interactive discussion with AI about HLD architectures.',
                  defaultVal: 5,
                  icon: Component,
                  color: 'text-indigo-700 bg-indigo-100',
                },
                {
                  key: 'aiGenerator' as const,
                  title: 'AI Full Architecture Generator',
                  desc: 'Generate complete end-to-end architectures from prompt.',
                  defaultVal: 5,
                  icon: Sparkles,
                  color: 'text-purple-700 bg-purple-100',
                },
                {
                  key: 'mentorChat' as const,
                  title: 'AI Mentor Chat Messages',
                  desc: 'AI Mentor & interview preparation conversational messages.',
                  defaultVal: 10,
                  icon: Bot,
                  color: 'text-amber-700 bg-amber-100',
                },
              ].map(item => {
                const Icon = item.icon;
                const currentVal = limits[item.key] ?? item.defaultVal;

                return (
                  <div
                    key={item.key}
                    className="p-5 rounded-2xl bg-bg/40 border border-primary/10 hover:border-primary/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                          <Icon size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-primary/50 uppercase">
                          Default: {item.defaultVal}
                        </span>
                      </div>
                      <h4 className="font-heading font-bold text-base text-primary-ink mb-1">{item.title}</h4>
                      <p className="text-xs text-primary/70 mb-4">{item.desc}</p>
                    </div>

                    {/* Stepper Control */}
                    <div className="pt-3 border-t border-primary/10 flex items-center justify-between">
                      <span className="text-xs font-semibold text-primary/80">Max Usage Allowed:</span>
                      <div className="flex items-center gap-1.5 bg-surface border border-primary/15 rounded-xl p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setLimits(prev => ({ ...prev, [item.key]: Math.max(0, (prev[item.key] || 0) - 1) }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                        >
                          <Minus size={14} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentVal}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10);
                            setLimits(prev => ({ ...prev, [item.key]: isNaN(val) ? 0 : Math.max(0, val) }));
                          }}
                          className="w-12 text-center text-sm font-bold font-code text-primary-ink bg-transparent outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setLimits(prev => ({ ...prev, [item.key]: (prev[item.key] || 0) + 1 }))}
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors cursor-pointer"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: USER MANAGEMENT & USAGE */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-soft">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-primary/10">
              <div>
                <h3 className="text-lg font-bold font-heading text-primary-ink">Registered User Quotas</h3>
                <p className="text-xs text-primary/60">Inspect individual AI usage metrics, set custom limits, or reset counters.</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or email..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-primary/15 rounded-xl bg-bg/50 focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleResetAllUsersUsage}
                  className="cursor-pointer px-3 py-2 text-xs font-bold text-warn hover:bg-warn/10 rounded-xl border border-warn/20 transition-colors whitespace-nowrap"
                >
                  Reset All Usage
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-primary/10 text-primary/60 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">LLD Usage</th>
                    <th className="py-3 px-3">HLD Usage</th>
                    <th className="py-3 px-3">AI Gen</th>
                    <th className="py-3 px-3">Mentor Chat</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {users.map((u) => {
                    const lldUsed = (u.aiUsage?.lldReview || 0) + (u.aiUsage?.lldChat || 0);
                    const hldUsed = (u.aiUsage?.hldReview || 0) + (u.aiUsage?.hldChat || 0);
                    const genUsed = u.aiUsage?.aiGenerator || 0;
                    const mentorUsed = u.aiUsage?.mentorChat || 0;

                    const hasCustom = u.customLimits && Object.values(u.customLimits).some(v => v !== null && v !== undefined);

                    return (
                      <tr key={u._id} className="hover:bg-bg/40 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-primary-ink">{u.name}</div>
                          <div className="text-[11px] font-code text-primary/60">{u.email}</div>
                          {hasCustom && (
                            <span className="inline-block mt-0.5 text-[9px] font-bold bg-accent/40 text-primary px-1.5 py-0.2 rounded">
                              Custom Limits Set
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-3">
                          <button
                            type="button"
                            onClick={() => handleToggleRole(u)}
                            className={`cursor-pointer px-2 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-primary text-surface'
                                : 'bg-primary/10 text-primary hover:bg-primary/20'
                            }`}
                            title="Click to toggle Admin / User role"
                          >
                            {u.role || 'user'}
                          </button>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-code font-semibold text-primary">
                            Review: {u.aiUsage?.lldReview || 0} | Chat: {u.aiUsage?.lldChat || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-code font-semibold text-primary">
                            Review: {u.aiUsage?.hldReview || 0} | Chat: {u.aiUsage?.hldChat || 0}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-code font-semibold text-primary">
                            {genUsed}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-code font-semibold text-primary">
                            {mentorUsed}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openUserEditModal(u)}
                              className="cursor-pointer p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                              title="Set Custom Limits"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleResetUserUsage(u._id, u.email)}
                              className="cursor-pointer p-1.5 text-warn hover:bg-warn/10 rounded-lg transition-colors"
                              title="Reset AI Usage"
                            >
                              <RotateCcw size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="py-8 text-center text-xs text-primary/50">No users found.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: LIVE ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="bg-surface p-6 rounded-2xl border border-primary/10 shadow-soft">
            <h3 className="text-lg font-bold font-heading text-primary-ink mb-1">Recent Visitor Impressions</h3>
            <p className="text-xs text-primary/60 mb-4">Latest incoming visits recorded in real time</p>

            <div className="space-y-2">
              {stats?.visitorStats?.recentLogs && stats.visitorStats.recentLogs.length > 0 ? (
                stats.visitorStats.recentLogs.map((log: any) => (
                  <div
                    key={log._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-bg/50 border border-primary/5 text-xs gap-2"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-accent-deep animate-pulse" />
                      <span className="font-code font-bold text-primary-ink">{log.path}</span>
                      <span className="text-primary/50 text-[11px]">ID: {log.visitorId?.substring(0, 12)}...</span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] text-primary/60">
                      <span>IP: {log.ip}</span>
                      <span className="flex items-center gap-1 font-mono">
                        <Clock size={12} />
                        {new Date(log.createdAt).toLocaleTimeString()} ({new Date(log.createdAt).toLocaleDateString()})
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-xs text-primary/50">No visitor logs recorded yet.</div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Custom User Limits Modal */}
      <AnimatePresence>
        {editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface rounded-2xl border border-primary/15 shadow-lift p-6 overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-primary/10 mb-4">
                <div>
                  <h3 className="text-lg font-bold font-heading text-primary-ink">Set Custom Limits</h3>
                  <p className="text-xs text-primary/60">Override global limits for {editingUser.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 text-primary/60 hover:text-primary-ink rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-primary/70 mb-4">
                Leave field empty to inherit the global default limit. Enter a specific number (e.g. 50, 100) to grant custom quota.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { key: 'lldReview', label: 'LLD Review Limit', global: limits.lldReview },
                  { key: 'lldChat', label: 'LLD Chat Limit', global: limits.lldChat },
                  { key: 'hldReview', label: 'HLD Review Limit', global: limits.hldReview },
                  { key: 'hldChat', label: 'HLD Chat Limit', global: limits.hldChat },
                  { key: 'aiGenerator', label: 'AI Gen Limit', global: limits.aiGenerator },
                  { key: 'mentorChat', label: 'Mentor Chat Limit', global: limits.mentorChat },
                ].map(item => (
                  <div key={item.key}>
                    <label className="block text-[11px] font-bold text-primary mb-1">
                      {item.label} (Global: {item.global})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={userCustomLimits[item.key] ?? ''}
                      onChange={(e) => setUserCustomLimits({ ...userCustomLimits, [item.key]: e.target.value })}
                      placeholder={`Global (${item.global})`}
                      className="w-full px-3 py-2 text-xs border border-primary/15 rounded-xl bg-bg/50 focus:ring-2 focus:ring-primary outline-none font-code text-primary-ink"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-primary/10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-primary/80 hover:text-primary-ink bg-bg rounded-xl border border-primary/10"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserCustomLimits}
                  disabled={savingUserLimit}
                  className="px-5 py-2 text-xs font-bold text-surface bg-primary hover:bg-primary-ink rounded-xl shadow-md disabled:opacity-60"
                >
                  {savingUserLimit ? 'Saving...' : 'Save User Limits'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

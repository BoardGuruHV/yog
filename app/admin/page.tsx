'use client';

/**
 * Admin Dashboard Overview
 * Platform-wide statistics and quick actions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Activity,
  TrendingUp,
  Award,
  Target,
  Clock,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Dumbbell,
  FileText,
  Shield,
} from 'lucide-react';

interface Stats {
  users: {
    total: number;
    newToday: number;
    newThisWeek: number;
    newThisMonth: number;
    activeToday: number;
    activeThisWeek: number;
  };
  content: {
    asanas: number;
    programs: number;
    practiceSessions: number;
    practiceMinutes: number;
  };
  engagement: {
    totalAchievements: number;
    achievementsUnlocked: number;
    averageStreak: number;
    activeGoals: number;
    completedGoals: number;
  };
  freePass: {
    pending: number;
    approved: number;
    completed: number;
  };
  generatedAt: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch('/api/admin/stats');
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('You must be an admin to access this page');
          }
          throw new Error('Failed to load statistics');
        }
        const data = await response.json();
        setStats(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">
          Last updated: {new Date(stats.generatedAt).toLocaleString()}
        </p>
      </div>

      {/* Quick Actions */}
      {stats.freePass.pending > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">
              {stats.freePass.pending} Free Pass request{stats.freePass.pending > 1 ? 's' : ''} pending review
            </span>
          </div>
          <Link
            href="/admin/free-pass"
            className="flex items-center gap-1 text-sm font-medium text-yellow-700 hover:text-yellow-800"
          >
            Review now <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* User Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-500" />
          Users
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Total Users"
            value={stats.users.total}
            color="indigo"
          />
          <StatCard
            label="Active Today"
            value={stats.users.activeToday}
            color="green"
          />
          <StatCard
            label="Active This Week"
            value={stats.users.activeThisWeek}
            color="blue"
          />
          <StatCard
            label="New Today"
            value={stats.users.newToday}
            color="purple"
            trend
          />
          <StatCard
            label="New This Week"
            value={stats.users.newThisWeek}
            color="cyan"
            trend
          />
          <StatCard
            label="New This Month"
            value={stats.users.newThisMonth}
            color="teal"
            trend
          />
        </div>
      </section>

      {/* Content Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-500" />
          Content & Practice
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Asanas"
            value={stats.content.asanas}
            color="green"
          />
          <StatCard
            label="Programs Created"
            value={stats.content.programs}
            color="blue"
          />
          <StatCard
            label="Practice Sessions"
            value={stats.content.practiceSessions}
            color="purple"
          />
          <StatCard
            label="Total Practice Minutes"
            value={stats.content.practiceMinutes.toLocaleString()}
            suffix="min"
            color="orange"
          />
        </div>
      </section>

      {/* Engagement Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-orange-500" />
          Engagement
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard
            label="Avg Streak"
            value={stats.engagement.averageStreak}
            suffix="days"
            color="orange"
          />
          <StatCard
            label="Total Achievements"
            value={stats.engagement.totalAchievements}
            color="yellow"
          />
          <StatCard
            label="Achievements Unlocked"
            value={stats.engagement.achievementsUnlocked}
            color="amber"
          />
          <StatCard
            label="Active Goals"
            value={stats.engagement.activeGoals}
            color="cyan"
          />
          <StatCard
            label="Completed Goals"
            value={stats.engagement.completedGoals}
            color="emerald"
          />
        </div>
      </section>

      {/* Free Pass Stats */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          Free Pass
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            label="Pending Review"
            value={stats.freePass.pending}
            color="yellow"
            alert={stats.freePass.pending > 0}
          />
          <StatCard
            label="Approved"
            value={stats.freePass.approved}
            color="green"
          />
          <StatCard
            label="Completed (with feedback)"
            value={stats.freePass.completed}
            color="blue"
          />
        </div>
      </section>

      {/* Quick Links */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickLink
            href="/admin/free-pass"
            icon={Shield}
            label="Free Pass Management"
            description="Review and approve requests"
          />
          <QuickLink
            href="/admin/users"
            icon={Users}
            label="User Management"
            description="Manage user accounts"
            comingSoon
          />
          <QuickLink
            href="/admin/content"
            icon={Dumbbell}
            label="Content Management"
            description="Manage asanas and programs"
            comingSoon
          />
          <QuickLink
            href="/admin/analytics"
            icon={TrendingUp}
            label="Analytics"
            description="Detailed platform analytics"
            comingSoon
          />
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number | string;
  color: string;
  suffix?: string;
  trend?: boolean;
  alert?: boolean;
}

function StatCard({ label, value, color, suffix, trend, alert }: StatCardProps) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    cyan: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    teal: 'bg-teal-50 border-teal-200 text-teal-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color] || colorClasses.indigo} ${alert ? 'ring-2 ring-yellow-400' : ''}`}>
      <p className="text-sm opacity-80">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-2xl font-bold">{value}</span>
        {suffix && <span className="text-sm opacity-60">{suffix}</span>}
        {trend && <TrendingUp className="w-4 h-4 ml-1 opacity-60" />}
      </div>
    </div>
  );
}

interface QuickLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  comingSoon?: boolean;
}

function QuickLink({ href, icon: Icon, label, description, comingSoon }: QuickLinkProps) {
  if (comingSoon) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 opacity-60">
        <Icon className="w-6 h-6 text-gray-400 mb-2" />
        <h3 className="font-medium text-gray-700">{label}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
        <span className="inline-block mt-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-sm">
          Coming Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all"
    >
      <Icon className="w-6 h-6 text-indigo-500 mb-2" />
      <h3 className="font-medium text-gray-900">{label}</h3>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </Link>
  );
}

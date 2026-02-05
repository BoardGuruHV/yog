'use client';

/**
 * Subscription Management Page
 * View and manage subscription details
 */

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Check,
  AlertCircle,
  Loader2,
  ExternalLink,
  RefreshCw,
  Crown,
  Zap,
  Sparkles,
  Calendar,
  TrendingUp,
  MessageSquare,
  FolderPlus,
} from 'lucide-react';
import Link from 'next/link';

interface SubscriptionInfo {
  tier: 'FREE' | 'PREMIUM' | 'PRO';
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  trialEnd: string | null;
  limits: {
    aiChatPerDay: number;
    programsTotal: number;
    aiProgramGeneration: boolean;
    poseDetection: boolean;
    fullAnalytics: boolean;
    offlineAccess: boolean;
    prioritySupport: boolean;
  };
  usage: {
    aiChatToday: number;
    programsCreated: number;
  };
}

export default function SubscriptionPage() {
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const success = searchParams.get('success');
  const canceled = searchParams.get('canceled');

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();

      if (data.success) {
        setSubscription(data.data);
      } else {
        setError(data.error?.message || 'Failed to load subscription');
      }
    } catch (err) {
      setError('Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setActionLoading('portal');

    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      if (data.success && data.data?.url) {
        window.location.href = data.data.url;
      } else {
        alert(data.error?.message || 'Failed to open billing portal');
      }
    } catch (err) {
      alert('Failed to open billing portal');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
      return;
    }

    setActionLoading('cancel');

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchSubscription();
      } else {
        alert(data.error?.message || 'Failed to cancel subscription');
      }
    } catch (err) {
      alert('Failed to cancel subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResumeSubscription = async () => {
    setActionLoading('resume');

    try {
      const response = await fetch('/api/subscription/resume', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        fetchSubscription();
      } else {
        alert(data.error?.message || 'Failed to resume subscription');
      }
    } catch (err) {
      alert('Failed to resume subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return <Crown className="w-6 h-6 text-amber-500" />;
      case 'PREMIUM':
        return <Zap className="w-6 h-6 text-indigo-500" />;
      default:
        return <Sparkles className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'PRO':
        return 'bg-amber-50 border-amber-200 text-amber-800';
      case 'PREMIUM':
        return 'bg-indigo-50 border-indigo-200 text-indigo-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

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
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchSubscription();
            }}
            className="mt-4 text-indigo-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) return null;

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Success/Cancel Messages */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <Check className="w-5 h-5 text-green-600" />
          <span className="text-green-800">
            Successfully subscribed! Welcome to {subscription.tier} tier.
          </span>
        </div>
      )}

      {canceled && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-yellow-800">
            Checkout was canceled. No charges were made.
          </span>
        </div>
      )}

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-8">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-bold text-gray-900">Subscription</h1>
          <p className="text-gray-500">Manage your subscription and billing</p>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {getTierIcon(subscription.tier)}
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {subscription.tier} Plan
                  </h2>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      subscription.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : subscription.status === 'TRIALING'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {subscription.status}
                  </span>
                </div>
                {subscription.cancelAtPeriodEnd && (
                  <p className="text-sm text-yellow-600">
                    Cancels on{' '}
                    {new Date(subscription.currentPeriodEnd!).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {subscription.tier !== 'FREE' && (
              <div className="flex gap-2">
                <button
                  onClick={handleManageBilling}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading === 'portal' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Manage Billing
                </button>

                {subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleResumeSubscription}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {actionLoading === 'resume' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Resume
                  </button>
                ) : (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={actionLoading !== null}
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === 'cancel' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Cancel'
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Billing Period */}
          {subscription.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Calendar className="w-4 h-4" />
              <span>
                Current period ends:{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Upgrade CTA for Free Users */}
          {subscription.tier === 'FREE' && (
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Upgrade Your Plan
              <ExternalLink className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs mb-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Usage</h2>
          <p className="text-sm text-gray-500">Your current usage and limits</p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-6">
          {/* AI Chat Usage */}
          <div className="p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-5 h-5 text-indigo-500" />
              <span className="font-medium text-gray-900">AI Chats Today</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {subscription.usage.aiChatToday}
              </span>
              <span className="text-gray-500">
                /{' '}
                {subscription.limits.aiChatPerDay === Infinity
                  ? 'Unlimited'
                  : subscription.limits.aiChatPerDay}
              </span>
            </div>
            {subscription.limits.aiChatPerDay !== Infinity && (
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (subscription.usage.aiChatToday /
                        subscription.limits.aiChatPerDay) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>

          {/* Programs Created */}
          <div className="p-4 rounded-xl bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <FolderPlus className="w-5 h-5 text-green-500" />
              <span className="font-medium text-gray-900">Programs Created</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-3xl font-bold text-gray-900">
                {subscription.usage.programsCreated}
              </span>
              <span className="text-gray-500">
                /{' '}
                {subscription.limits.programsTotal === Infinity
                  ? 'Unlimited'
                  : subscription.limits.programsTotal}
              </span>
            </div>
            {subscription.limits.programsTotal !== Infinity && (
              <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      (subscription.usage.programsCreated /
                        subscription.limits.programsTotal) *
                        100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Access */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Features</h2>
          <p className="text-sm text-gray-500">Features included in your plan</p>
        </div>

        <div className="p-6 grid md:grid-cols-2 gap-4">
          <FeatureItem
            name="AI Program Generation"
            enabled={subscription.limits.aiProgramGeneration}
          />
          <FeatureItem
            name="Pose Detection"
            enabled={subscription.limits.poseDetection}
          />
          <FeatureItem
            name="Full Analytics"
            enabled={subscription.limits.fullAnalytics}
          />
          <FeatureItem
            name="Offline Access"
            enabled={subscription.limits.offlineAccess}
          />
          <FeatureItem
            name="Priority Support"
            enabled={subscription.limits.prioritySupport}
          />
        </div>

        {subscription.tier === 'FREE' && (
          <div className="p-6 pt-0">
            <Link
              href="/pricing"
              className="text-indigo-600 hover:underline text-sm"
            >
              Upgrade to unlock more features →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function FeatureItem({ name, enabled }: { name: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {enabled ? (
        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      ) : (
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
          <span className="w-2 h-2 bg-gray-300 rounded-full" />
        </div>
      )}
      <span className={enabled ? 'text-gray-900' : 'text-gray-400'}>{name}</span>
    </div>
  );
}

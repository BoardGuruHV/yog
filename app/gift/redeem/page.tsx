'use client';

/**
 * Gift Redeem Page
 * Allow users to redeem gift subscriptions
 */

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Gift,
  Loader2,
  AlertCircle,
  Check,
  Crown,
  Zap,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

interface GiftDetails {
  id: string;
  status: string;
  tier: 'PREMIUM' | 'PRO';
  durationMonths: number;
  message: string | null;
  senderName: string;
  recipientName: string | null;
  purchasedAt: string | null;
  redeemedAt: string | null;
}

export default function GiftRedeemPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const code = searchParams.get('code');

  const [gift, setGift] = useState<GiftDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (code) {
      fetchGift(code);
    } else {
      setLoading(false);
      setError('No gift code provided');
    }
  }, [code]);

  const fetchGift = async (giftCode: string) => {
    try {
      const response = await fetch(`/api/gifts/redeem?code=${giftCode}`);
      const data = await response.json();

      if (data.success) {
        setGift(data.data);
      } else {
        setError(data.error?.message || 'Gift not found');
      }
    } catch (err) {
      setError('Failed to load gift');
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!code) return;

    setRedeeming(true);
    setError(null);

    try {
      const response = await fetch('/api/gifts/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftCode: code }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.error?.message || 'Failed to redeem gift');
      }
    } catch (err) {
      setError('Failed to redeem gift');
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Gift Redeemed!
          </h1>
          <p className="text-gray-600 mb-6">
            Your {gift?.tier} subscription has been activated for{' '}
            {gift?.durationMonths} month{gift?.durationMonths !== 1 ? 's' : ''}.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (error && !gift) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Invalid Gift Code
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="text-indigo-600 hover:underline"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!gift) return null;

  const isAlreadyRedeemed = gift.status === 'REDEEMED';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-indigo-50 to-white p-4">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white text-center">
          <Gift className="w-12 h-12 mx-auto mb-3" />
          <h1 className="text-2xl font-bold">You&apos;ve Got a Gift!</h1>
          <p className="opacity-90 mt-1">From {gift.senderName}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Gift Details */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3 mb-4">
              {gift.tier === 'PRO' ? (
                <Crown className="w-6 h-6 text-amber-500" />
              ) : (
                <Zap className="w-6 h-6 text-indigo-500" />
              )}
              <div>
                <h2 className="font-semibold text-gray-900">
                  {gift.tier} Subscription
                </h2>
                <p className="text-sm text-gray-500">
                  {gift.durationMonths} month{gift.durationMonths !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {gift.message && (
              <div className="flex items-start gap-2 pt-4 border-t border-gray-200">
                <MessageSquare className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600 italic">&ldquo;{gift.message}&rdquo;</p>
              </div>
            )}
          </div>

          {/* Status Messages */}
          {isAlreadyRedeemed ? (
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-4">
                <Check className="w-5 h-5" />
                <span className="font-medium">Already Redeemed</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                This gift was redeemed on{' '}
                {new Date(gift.redeemedAt!).toLocaleDateString()}
              </p>
              <Link
                href="/dashboard"
                className="text-indigo-600 hover:underline"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : authStatus === 'unauthenticated' ? (
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Sign in or create an account to redeem your gift.
              </p>
              <Link
                href={`/auth/signin?callbackUrl=/gift/redeem?code=${code}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Sign In to Redeem
              </Link>
            </div>
          ) : (
            <div className="text-center">
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              <button
                onClick={handleRedeem}
                disabled={redeeming}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {redeeming ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Redeeming...
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    Redeem Gift
                  </>
                )}
              </button>
              <p className="text-gray-500 text-sm mt-3">
                This will activate your {gift.tier} subscription
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

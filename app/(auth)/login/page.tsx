'use client';

/**
 * Login Page
 * Split-screen layout with hero carousel on left and auth form on right
 */

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { LoginHero, MobileHero } from '@/components/auth/LoginHero';
import { LoginForm } from '@/components/auth/LoginForm';

function LoginContent() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side - Hero (Hidden on mobile, shown on lg+) */}
      <div className="lg:w-1/2">
        <LoginHero />
      </div>

      {/* Mobile Hero */}
      <MobileHero />

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 lg:px-8 lg:py-12 bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
              Welcome to Yog
            </h2>
            <p className="text-gray-600">
              Sign in to continue your yoga journey
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-green-600 hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-green-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-b from-green-50 to-white flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

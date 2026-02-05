'use client';

/**
 * Login Form Component
 * Multi-tab authentication form with Password, Magic Link, and Free Pass options
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  Sparkles,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  Check,
  AlertCircle,
  Building2,
  Briefcase,
  FileText,
} from 'lucide-react';
import { extractCompanyFromEmail } from '@/lib/validation/email';

type AuthTab = 'password' | 'magic-link' | 'free-pass';

interface FormErrors {
  email?: string;
  password?: string;
  companyName?: string;
  jobTitle?: string;
  useCase?: string;
  terms?: string;
  nda?: string;
}

export function LoginForm() {
  const [activeTab, setActiveTab] = useState<AuthTab>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [useCase, setUseCase] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedNda, setAcceptedNda] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Auto-extract company name from email for Free Pass
  useEffect(() => {
    if (activeTab === 'free-pass' && email) {
      const extracted = extractCompanyFromEmail(email);
      if (extracted && !companyName) {
        setCompanyName(extracted);
      }
    }
  }, [email, activeTab, companyName]);

  const tabs: { id: AuthTab; label: string; icon: React.ReactNode }[] = [
    { id: 'password', label: 'Password', icon: <Lock className="h-4 w-4" /> },
    { id: 'magic-link', label: 'Magic Link', icon: <Sparkles className="h-4 w-4" /> },
    { id: 'free-pass', label: 'Free Pass', icon: <Mail className="h-4 w-4" /> },
  ];

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation for all tabs - simple format check only
    if (!email) {
      newErrors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    // Password validation for password tab
    if (activeTab === 'password' && !password) {
      newErrors.password = 'Password is required';
    }

    // Free Pass specific validations - only terms and NDA required
    if (activeTab === 'free-pass') {
      if (!acceptedTerms) {
        newErrors.terms = 'You must accept the Terms of Service';
      }
      if (!acceptedNda) {
        newErrors.nda = 'You must accept the NDA';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      if (activeTab === 'password') {
        // Password login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          setSubmitStatus('success');
          setStatusMessage('Login successful! Redirecting...');
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
        } else {
          const data = await response.json();
          setSubmitStatus('error');
          setStatusMessage(data.error || 'Invalid email or password');
        }
      } else if (activeTab === 'magic-link') {
        // Magic link request
        const response = await fetch('/api/auth/magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (response.ok) {
          setSubmitStatus('success');
          setStatusMessage('Check your email for the magic link!');
        } else {
          const data = await response.json();
          setSubmitStatus('error');
          setStatusMessage(data.error || 'Failed to send magic link');
        }
      } else if (activeTab === 'free-pass') {
        // Free pass request
        const response = await fetch('/api/auth/free-pass/request', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            companyName,
            jobTitle,
            useCase,
            termsAccepted: acceptedTerms,
            ndaAccepted: acceptedNda,
          }),
        });

        if (response.ok) {
          setSubmitStatus('success');
          setStatusMessage(
            'Your Free Pass request has been submitted! You will receive an email once approved (usually within 24 hours).'
          );
        } else {
          const data = await response.json();
          setSubmitStatus('error');
          setStatusMessage(data.error || 'Failed to submit request');
        }
      }
    } catch (error) {
      setSubmitStatus('error');
      setStatusMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setCompanyName('');
    setJobTitle('');
    setUseCase('');
    setAcceptedTerms(false);
    setAcceptedNda(false);
    setErrors({});
    setSubmitStatus('idle');
    setStatusMessage('');
  };

  const handleTabChange = (tab: AuthTab) => {
    setActiveTab(tab);
    setErrors({});
    setSubmitStatus('idle');
    setStatusMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tabs */}
      <div className="flex rounded-xl bg-gray-100 p-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white text-green-700 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.icon}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <AnimatePresence mode="wait">
        <motion.p
          key={activeTab}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="text-sm text-gray-500 mb-6 text-center"
        >
          {activeTab === 'password' && 'Sign in with your email and password'}
          {activeTab === 'magic-link' && 'We\'ll send you a link to sign in'}
          {activeTab === 'free-pass' && 'Request 24-hour full access to explore Yog'}
        </motion.p>
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Input - All tabs */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 ${
                errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.email}
            </p>
          )}
        </div>

        {/* Password Input - Password tab only */}
        {activeTab === 'password' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.password}
              </p>
            )}
            <div className="mt-2 text-right">
              <a href="/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                Forgot password?
              </a>
            </div>
          </div>
        )}

        {/* Free Pass Additional Fields */}
        {activeTab === 'free-pass' && (
          <>
            {/* Optional Fields - Company & Job Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Company Name (Optional) */}
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                  Company <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="companyName"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Your Company"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              {/* Job Title (Optional) */}
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title <span className="text-gray-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="jobTitle"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Yoga Instructor"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>

            {/* Use Case (Optional) */}
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-gray-700 mb-1">
                How do you plan to use Yog? <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="useCase"
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Tell us briefly about your intended use..."
                  rows={2}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>
            </div>

            {/* Terms & NDA Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-green-600 hover:underline"
                  >
                    Terms of Service
                  </button>
                </span>
              </label>
              {errors.terms && (
                <p className="text-sm text-red-500 flex items-center gap-1 ml-7">
                  <AlertCircle className="h-4 w-4" />
                  {errors.terms}
                </p>
              )}

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={acceptedNda}
                  onChange={(e) => setAcceptedNda(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded-sm border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-600">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="text-green-600 hover:underline"
                  >
                    Non-Disclosure Agreement (NDA)
                  </button>
                </span>
              </label>
              {errors.nda && (
                <p className="text-sm text-red-500 flex items-center gap-1 ml-7">
                  <AlertCircle className="h-4 w-4" />
                  {errors.nda}
                </p>
              )}
            </div>

            {/* Free Pass Info Box */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">How Free Pass Works</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your request will be reviewed by our team</li>
                <li>• Once approved, you&apos;ll get 24-hour full access</li>
                <li>• We&apos;ll ask for feedback after your trial ends</li>
              </ul>
            </div>
          </>
        )}

        {/* Status Message */}
        {submitStatus !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg flex items-start gap-3 ${
              submitStatus === 'success'
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {submitStatus === 'success' ? (
              <Check className="h-5 w-5 shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 shrink-0" />
            )}
            <p className="text-sm">{statusMessage}</p>
          </motion.div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || submitStatus === 'success'}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white font-medium transition-all ${
            isLoading || submitStatus === 'success'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>
                {activeTab === 'password' && 'Signing in...'}
                {activeTab === 'magic-link' && 'Sending link...'}
                {activeTab === 'free-pass' && 'Submitting request...'}
              </span>
            </>
          ) : submitStatus === 'success' ? (
            <>
              <Check className="h-5 w-5" />
              <span>
                {activeTab === 'password' && 'Signed in!'}
                {activeTab === 'magic-link' && 'Link sent!'}
                {activeTab === 'free-pass' && 'Request submitted!'}
              </span>
            </>
          ) : (
            <>
              <span>
                {activeTab === 'password' && 'Sign In'}
                {activeTab === 'magic-link' && 'Send Magic Link'}
                {activeTab === 'free-pass' && 'Request Free Pass'}
              </span>
              <ArrowRight className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Register link */}
        {activeTab !== 'free-pass' && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Don&apos;t have an account?{' '}
            <a href="/register" className="text-green-600 hover:text-green-700 font-medium">
              Create one
            </a>
          </p>
        )}
      </form>

      {/* Terms Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAcceptTerms={() => {
          setAcceptedTerms(true);
          setShowTermsModal(false);
        }}
        onAcceptNda={() => {
          setAcceptedNda(true);
          setShowTermsModal(false);
        }}
      />
    </div>
  );
}

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcceptTerms: () => void;
  onAcceptNda: () => void;
}

function TermsModal({ isOpen, onClose, onAcceptTerms, onAcceptNda }: TermsModalProps) {
  const [activeSection, setActiveSection] = useState<'terms' | 'nda'>('terms');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Legal Agreements</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveSection('terms')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'terms'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Terms of Service
            </button>
            <button
              onClick={() => setActiveSection('nda')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === 'nda'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Non-Disclosure Agreement
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {activeSection === 'terms' ? (
            <div className="prose prose-sm max-w-none">
              <h3>Terms of Service</h3>
              <p>Last updated: January 2025</p>

              <h4>1. Acceptance of Terms</h4>
              <p>
                By accessing or using the Yog platform (&ldquo;Service&rdquo;), you agree to be bound by these
                Terms of Service. If you do not agree to these terms, please do not use our Service.
              </p>

              <h4>2. Description of Service</h4>
              <p>
                Yog is a yoga asana learning platform that provides educational content, practice programs,
                and wellness tools. The Service is provided for personal, non-commercial use.
              </p>

              <h4>3. Free Pass Access</h4>
              <p>
                The Free Pass program provides temporary 24-hour access to the platform for evaluation purposes.
                During this period, you may explore all features. Access will automatically expire after 24 hours
                from approval.
              </p>

              <h4>4. User Conduct</h4>
              <p>You agree not to:</p>
              <ul>
                <li>Share your access credentials with others</li>
                <li>Attempt to reverse engineer or copy our content</li>
                <li>Use automated tools to scrape or download content</li>
                <li>Redistribute any content from the platform</li>
              </ul>

              <h4>5. Intellectual Property</h4>
              <p>
                All content, including but not limited to text, graphics, images, videos, and software,
                is owned by Yog or its licensors and is protected by copyright laws.
              </p>

              <h4>6. Health Disclaimer</h4>
              <p>
                The content provided is for informational purposes only. Always consult a healthcare
                provider before beginning any exercise program. Yog is not responsible for any injuries
                that may occur during practice.
              </p>

              <h4>7. Limitation of Liability</h4>
              <p>
                Yog shall not be liable for any indirect, incidental, special, or consequential damages
                arising from your use of the Service.
              </p>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <h3>Non-Disclosure Agreement</h3>
              <p>Last updated: January 2025</p>

              <h4>1. Confidential Information</h4>
              <p>
                As a Free Pass user, you may have access to features, designs, and functionality that
                are not yet publicly available. This includes but is not limited to:
              </p>
              <ul>
                <li>Unreleased features and functionality</li>
                <li>User interface designs and layouts</li>
                <li>Program algorithms and recommendations</li>
                <li>Business strategies and roadmaps</li>
                <li>Any content marked as confidential or beta</li>
              </ul>

              <h4>2. Non-Disclosure Obligations</h4>
              <p>You agree to:</p>
              <ul>
                <li>Keep all confidential information strictly confidential</li>
                <li>Not disclose any confidential information to third parties</li>
                <li>Not post screenshots, videos, or descriptions on social media</li>
                <li>Not discuss confidential features with non-authorized persons</li>
                <li>Delete any downloaded or cached content after your access expires</li>
              </ul>

              <h4>3. Duration</h4>
              <p>
                This NDA remains in effect for 2 years from the date of acceptance, regardless of
                whether your Free Pass access has expired.
              </p>

              <h4>4. Exceptions</h4>
              <p>
                This NDA does not apply to information that:
              </p>
              <ul>
                <li>Is already publicly known at the time of disclosure</li>
                <li>Becomes publicly known through no fault of yours</li>
                <li>Is required to be disclosed by law</li>
              </ul>

              <h4>5. Consequences of Breach</h4>
              <p>
                Any breach of this NDA may result in immediate termination of access and potential
                legal action to recover damages.
              </p>

              <h4>6. Feedback</h4>
              <p>
                Any feedback you provide about the Service may be used by Yog without obligation or
                compensation to you.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
          {activeSection === 'terms' ? (
            <button
              onClick={onAcceptTerms}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept Terms
            </button>
          ) : (
            <button
              onClick={onAcceptNda}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Accept NDA
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

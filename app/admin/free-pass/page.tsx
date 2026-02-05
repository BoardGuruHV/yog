'use client';

/**
 * Admin Free Pass Management Page
 * View, approve, and reject Free Pass requests
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  Check,
  X,
  Clock,
  Mail,
  Building2,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
} from 'lucide-react';

type FreePassStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'COMPLETED';

interface FreePassRequest {
  id: string;
  email: string;
  companyName: string | null;
  companyDomain: string | null;
  jobTitle: string | null;
  useCase: string | null;
  status: FreePassStatus;
  termsAcceptedAt: string;
  ndaAcceptedAt: string;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  accessStartedAt: string | null;
  accessExpiresAt: string | null;
  createdAt: string;
  _count: {
    activities: number;
  };
}

interface Analytics {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
  completedRequests: number;
  feedbackCount: number;
  averageRating: number | null;
  conversionRate: string | number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function AdminFreePassPage() {
  const [requests, setRequests] = useState<FreePassRequest[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FreePassStatus | 'ALL'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal state for actions
  const [actionModal, setActionModal] = useState<{
    type: 'approve' | 'reject';
    request: FreePassRequest;
  } | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        analytics: 'true',
      });

      if (statusFilter !== 'ALL') {
        params.set('status', statusFilter);
      }

      // Demo mode for development (localhost)
      if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
        params.set('demo', 'true');
      }

      const response = await fetch(`/api/admin/free-pass?${params}`);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('You must be an admin to access this page');
        }
        throw new Error('Failed to load Free Pass requests');
      }

      const data = await response.json();
      setRequests(data.requests);
      setPagination(data.pagination);
      if (data.analytics) {
        setAnalytics(data.analytics);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAction = async (action: 'approve' | 'reject') => {
    if (!actionModal) return;

    setProcessingId(actionModal.request.id);

    try {
      const response = await fetch('/api/admin/free-pass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          requestId: actionModal.request.id,
          adminNotes: actionNotes || undefined,
          rejectionReason: action === 'reject' ? rejectionReason : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Action failed');
      }

      // Refresh the list
      await fetchRequests();
      setActionModal(null);
      setActionNotes('');
      setRejectionReason('');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: FreePassStatus) => {
    const styles = {
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
      COMPLETED: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const icons = {
      PENDING: <Clock className="w-3.5 h-3.5" />,
      APPROVED: <CheckCircle className="w-3.5 h-3.5" />,
      REJECTED: <XCircle className="w-3.5 h-3.5" />,
      EXPIRED: <AlertCircle className="w-3.5 h-3.5" />,
      COMPLETED: <Check className="w-3.5 h-3.5" />,
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {status}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Free Pass Management</h1>
                <p className="text-sm text-gray-500">
                  Review and manage Free Pass requests
                </p>
              </div>
            </div>
            <button
              onClick={() => fetchRequests()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Analytics Cards */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalRequests}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4">
              <p className="text-sm text-yellow-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-700">{analytics.pendingRequests}</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4">
              <p className="text-sm text-green-600">Approved</p>
              <p className="text-2xl font-bold text-green-700">{analytics.approvedRequests}</p>
            </div>
            <div className="bg-red-50 rounded-xl border border-red-200 p-4">
              <p className="text-sm text-red-600">Rejected</p>
              <p className="text-2xl font-bold text-red-700">{analytics.rejectedRequests}</p>
            </div>
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
              <p className="text-sm text-blue-600">Completed</p>
              <p className="text-2xl font-bold text-blue-700">{analytics.completedRequests}</p>
            </div>
            <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
              <p className="text-sm text-purple-600">Avg Rating</p>
              <p className="text-2xl font-bold text-purple-700">
                {analytics.averageRating ? analytics.averageRating.toFixed(1) : 'N/A'}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Filter by status:</span>
            <div className="flex gap-2 flex-wrap">
              {['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as FreePassStatus | 'ALL')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && requests.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Loader2 className="w-8 h-8 text-green-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading requests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{error}</p>
            <button
              onClick={() => fetchRequests()}
              className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && requests.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'ALL'
                ? `No ${statusFilter.toLowerCase()} requests at the moment.`
                : 'No Free Pass requests yet.'}
            </p>
          </div>
        )}

        {/* Requests List */}
        {!loading && !error && requests.length > 0 && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Main Row */}
                <div
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{request.email}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        {request.companyName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {request.companyName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatDate(request.createdAt)}
                        </span>
                        {request._count.activities > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5" />
                            {request._count.activities} activities
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {request.status === 'PENDING' && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'approve', request });
                          }}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionModal({ type: 'reject', request });
                          }}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    {expandedId === request.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedId === request.id && (
                  <div className="border-t border-gray-200 p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {request.jobTitle && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Job Title</span>
                          <p className="text-gray-900">{request.jobTitle}</p>
                        </div>
                      )}
                      {request.companyDomain && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Domain</span>
                          <p className="text-gray-900">{request.companyDomain}</p>
                        </div>
                      )}
                      {request.useCase && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Use Case</span>
                          <p className="text-gray-900 flex items-start gap-2">
                            <MessageSquare className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                            {request.useCase}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Terms Accepted</span>
                        <p className="text-gray-900">{formatDate(request.termsAcceptedAt)}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500 uppercase tracking-wide">NDA Accepted</span>
                        <p className="text-gray-900">{formatDate(request.ndaAcceptedAt)}</p>
                      </div>
                      {request.accessStartedAt && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Access Started</span>
                          <p className="text-gray-900">{formatDate(request.accessStartedAt)}</p>
                        </div>
                      )}
                      {request.accessExpiresAt && (
                        <div>
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Access Expires</span>
                          <p className="text-gray-900">{formatDate(request.accessExpiresAt)}</p>
                        </div>
                      )}
                      {request.rejectionReason && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Rejection Reason</span>
                          <p className="text-red-600">{request.rejectionReason}</p>
                        </div>
                      )}
                      {request.adminNotes && (
                        <div className="md:col-span-2">
                          <span className="text-xs text-gray-500 uppercase tracking-wide">Admin Notes</span>
                          <p className="text-gray-900">{request.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => fetchRequests(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-gray-600">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchRequests(pagination.page + 1)}
                  disabled={!pagination.hasMore}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {actionModal.type === 'approve' ? 'Approve Free Pass' : 'Reject Free Pass'}
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{actionModal.request.email}</p>
                {actionModal.request.companyName && (
                  <p className="text-sm text-gray-500">{actionModal.request.companyName}</p>
                )}
              </div>

              {actionModal.type === 'reject' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a reason...</option>
                    <option value="Invalid business email">Invalid business email</option>
                    <option value="Suspicious activity">Suspicious activity</option>
                    <option value="Duplicate request">Duplicate request</option>
                    <option value="Competitor">Competitor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder="Add any internal notes..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {actionModal.type === 'approve' && (
                <p className="text-sm text-gray-500 mb-4">
                  This will grant 24-hour access to the platform. The user will receive an email with login instructions.
                </p>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={() => {
                  setActionModal(null);
                  setActionNotes('');
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAction(actionModal.type)}
                disabled={processingId === actionModal.request.id || (actionModal.type === 'reject' && !rejectionReason)}
                className={`px-4 py-2 rounded-lg text-white transition-colors flex items-center gap-2 ${
                  actionModal.type === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {processingId === actionModal.request.id && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {actionModal.type === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

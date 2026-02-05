"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Link2, Eye, Download, Globe, Lock } from "lucide-react";
import QRCode from "./QRCode";
import SocialButtons from "./SocialButtons";

interface ShareModalProps {
  programId: string;
  programName: string;
  onClose: () => void;
}

interface ShareData {
  shareCode: string;
  isPublic: boolean;
  views: number;
  copies: number;
}

export default function ShareModal({
  programId,
  programName,
  onClose,
}: ShareModalProps) {
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [updating, setUpdating] = useState(false);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const shareUrl = shareData ? `${baseUrl}/shared/${shareData.shareCode}` : "";

  useEffect(() => {
    createOrGetShare();
  }, [programId]);

  const createOrGetShare = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create share link");
      }

      const data = await response.json();
      setShareData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async () => {
    if (!shareData) return;

    setUpdating(true);
    try {
      const response = await fetch("/api/share", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programId,
          isPublic: !shareData.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update visibility");
      }

      const data = await response.json();
      setShareData((prev) => (prev ? { ...prev, isPublic: data.isPublic } : null));
    } catch (err) {
      console.error("Error updating visibility:", err);
    } finally {
      setUpdating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `${programName.replace(/\s+/g, "-")}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-green-600" />
            <h2 className="text-lg font-semibold text-gray-900">
              Share Program
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-green-200 border-t-green-500 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={createOrGetShare}
                className="mt-2 text-sm text-red-700 hover:underline"
              >
                Try Again
              </button>
            </div>
          )}

          {shareData && !loading && (
            <>
              {/* Program name */}
              <div>
                <p className="text-sm text-gray-500">Sharing</p>
                <p className="font-medium text-gray-900">{programName}</p>
              </div>

              {/* Visibility toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  {shareData.isPublic ? (
                    <Globe className="w-5 h-5 text-green-600" />
                  ) : (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {shareData.isPublic ? "Public" : "Private"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {shareData.isPublic
                        ? "Anyone with the link can view"
                        : "Only you can access this link"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={toggleVisibility}
                  disabled={updating}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    shareData.isPublic
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  } disabled:opacity-50`}
                >
                  {updating ? "..." : shareData.isPublic ? "Make Private" : "Make Public"}
                </button>
              </div>

              {/* Share URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-hidden"
                  />
                  <button
                    onClick={copyToClipboard}
                    className={`px-3 py-2 rounded-lg transition-colors ${
                      copied
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {copied ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Eye className="w-4 h-4" />
                  <span>{shareData.views} views</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Download className="w-4 h-4" />
                  <span>{shareData.copies} copies</span>
                </div>
              </div>

              {/* QR Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  QR Code
                </label>
                <div className="flex items-start gap-4">
                  <QRCode value={shareUrl} size={120} />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      Scan this QR code to open the shared program
                    </p>
                    <button
                      onClick={downloadQRCode}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download QR
                    </button>
                  </div>
                </div>
              </div>

              {/* Social sharing */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share on Social Media
                </label>
                <SocialButtons
                  url={shareUrl}
                  title={`Check out my yoga program: ${programName}`}
                  description={`I created this yoga program and wanted to share it with you!`}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

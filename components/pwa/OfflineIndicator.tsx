"use client";

import { useState, useEffect } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";
import { syncPendingItems } from "@/lib/offline/sync";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showBanner, setShowBanner] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);
    setShowBanner(!navigator.onLine);

    const handleOnline = async () => {
      setIsOnline(true);
      setSyncMessage("Back online! Syncing...");
      setShowBanner(true);
      setIsSyncing(true);

      try {
        const result = await syncPendingItems();
        if (result.syncedCount > 0) {
          setSyncMessage(`Synced ${result.syncedCount} item(s)`);
        } else {
          setSyncMessage("Back online!");
        }
      } catch {
        setSyncMessage("Back online!");
      }

      setIsSyncing(false);

      // Hide banner after 3 seconds
      setTimeout(() => {
        setShowBanner(false);
        setSyncMessage(null);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowBanner(true);
      setSyncMessage(null);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!showBanner) {
    return null;
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium transition-all duration-300 ${
        isOnline
          ? "bg-green-500 text-white"
          : "bg-amber-500 text-white"
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        {isOnline ? (
          <>
            {isSyncing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Wifi className="w-4 h-4" />
            )}
            <span>{syncMessage || "Connected"}</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4" />
            <span>You&apos;re offline. Some features may be limited.</span>
          </>
        )}
      </div>
    </div>
  );
}

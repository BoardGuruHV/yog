"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, Clock, Play, ArrowRight, Loader2, CalendarDays } from "lucide-react";

interface ActivityItem {
  id: string;
  type: "practice" | "program_created" | "program_completed";
  title: string;
  description: string;
  duration?: number;
  timestamp: string;
  programId?: string;
}

export default function RecentActivityWidget() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch("/api/dashboard/activity");
      if (response.ok) {
        const data = await response.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error("Failed to fetch activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getActivityIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "practice":
        return Play;
      case "program_created":
        return CalendarDays;
      case "program_completed":
        return History;
      default:
        return History;
    }
  };

  const getActivityColor = (type: ActivityItem["type"]) => {
    switch (type) {
      case "practice":
        return "bg-green-100 text-green-600";
      case "program_created":
        return "bg-purple-100 text-purple-600";
      case "program_completed":
        return "bg-sage-100 text-sage-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-sage-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-sage-600" />
          <h3 className="font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <Link
          href="/program"
          className="text-sm text-sage-600 hover:text-sage-700 flex items-center gap-1"
        >
          View all
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const colorClass = getActivityColor(activity.type);

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800">{activity.title}</p>
                  <p className="text-sm text-gray-500 truncate">{activity.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                    <span>{formatTime(activity.timestamp)}</span>
                    {activity.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.duration} min
                      </span>
                    )}
                  </div>
                </div>
                {activity.programId && (
                  <Link
                    href={`/practice/guided/${activity.programId}`}
                    className="px-3 py-1.5 bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors"
                  >
                    Resume
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
            <History className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 mb-2">No recent activity</p>
          <p className="text-sm text-gray-400 mb-4">
            Start practicing to see your activity here
          </p>
          <Link
            href="/generate"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
          >
            Create Your First Program
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}

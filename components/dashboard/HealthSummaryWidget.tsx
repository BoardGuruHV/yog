"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart, Shield, AlertTriangle, ChevronRight, Loader2, Plus } from "lucide-react";

interface HealthSummary {
  conditionCount: number;
  conditions: {
    id: string;
    name: string;
    severity: string | null;
  }[];
  contraindicatedCount: number;
  cautionCount: number;
}

export default function HealthSummaryWidget() {
  const [summary, setSummary] = useState<HealthSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const response = await fetch("/api/dashboard/health-summary");
      if (response.ok) {
        const data = await response.json();
        setSummary(data);
      }
    } catch (error) {
      console.error("Failed to fetch health summary:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 text-sage-400 animate-spin" />
        </div>
      </div>
    );
  }

  const data = summary || {
    conditionCount: 0,
    conditions: [],
    contraindicatedCount: 0,
    cautionCount: 0,
  };

  const getSeverityColor = (severity: string | null) => {
    switch (severity) {
      case "severe":
        return "bg-red-100 text-red-700";
      case "moderate":
        return "bg-orange-100 text-orange-700";
      case "mild":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-sage-100 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-800">Health Profile</h3>
        </div>
        <Link
          href="/onboarding/health"
          className="text-sm text-sage-600 hover:text-sage-700"
        >
          Edit
        </Link>
      </div>

      {data.conditionCount > 0 ? (
        <>
          {/* Conditions List */}
          <div className="space-y-2 mb-4">
            {data.conditions.slice(0, 3).map((condition) => (
              <div
                key={condition.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{condition.name}</span>
                {condition.severity && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(
                      condition.severity
                    )}`}
                  >
                    {condition.severity}
                  </span>
                )}
              </div>
            ))}
            {data.conditions.length > 3 && (
              <p className="text-sm text-gray-500 text-center">
                +{data.conditions.length - 3} more conditions
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {data.contraindicatedCount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <div>
                  <p className="text-lg font-semibold text-red-700">
                    {data.contraindicatedCount}
                  </p>
                  <p className="text-xs text-red-600">poses to avoid</p>
                </div>
              </div>
            )}
            {data.cautionCount > 0 && (
              <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                <Shield className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-lg font-semibold text-amber-700">
                    {data.cautionCount}
                  </p>
                  <p className="text-xs text-amber-600">need caution</p>
                </div>
              </div>
            )}
          </div>

          {/* Safe Practice Note */}
          <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
            <Shield className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-green-700">
              Your library is personalized to show warnings for poses that may not be suitable
              for your conditions.
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6 text-sage-600" />
          </div>
          <p className="text-gray-600 mb-2">No health conditions set</p>
          <p className="text-sm text-gray-500 mb-4">
            Add your health conditions to get personalized safety warnings
          </p>
          <Link
            href="/onboarding/health"
            className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-lg hover:bg-sage-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Conditions
          </Link>
        </div>
      )}
    </div>
  );
}

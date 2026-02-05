"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Activity,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useProgram } from "@/context/ProgramContext";

interface Alert {
  id: string;
  type: "warning" | "caution" | "tip";
  category: string;
  title: string;
  message: string;
  affectedPoses?: string[];
  suggestion?: string;
}

interface AnalysisResult {
  alerts: Alert[];
  alertCount: number;
  overallRisk: "low" | "moderate" | "high";
  bodyPartStress: Record<string, number>;
  recommendations: string[];
  summary: {
    warnings: number;
    cautions: number;
    tips: number;
  };
}

interface SafetyAlertProps {
  compact?: boolean;
  showBodyMap?: boolean;
}

export default function SafetyAlert({
  compact = false,
  showBodyMap = true,
}: SafetyAlertProps) {
  const { state } = useProgram();
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const fetchAnalysis = useCallback(async () => {
    if (state.asanas.length === 0) {
      setAnalysis(null);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/safety/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          asanas: state.asanas
            .filter((a) => a.asana) // Only include asanas with full data
            .map((a) => ({
              id: a.asanaId,
              nameEnglish: a.asana!.nameEnglish,
              nameSanskrit: a.asana!.nameSanskrit,
              category: a.asana!.category,
              difficulty: a.asana!.difficulty,
              targetBodyParts: a.asana!.targetBodyParts,
            })),
          mode: "full",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error("Safety analysis error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [state.asanas]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "caution":
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-blue-500" />;
    }
  };

  const getAlertStyles = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return "bg-red-50 border-red-200";
      case "caution":
        return "bg-amber-50 border-amber-200";
      case "tip":
        return "bg-blue-50 border-blue-200";
    }
  };

  const getRiskColor = (risk: AnalysisResult["overallRisk"]) => {
    switch (risk) {
      case "high":
        return "text-red-600 bg-red-100";
      case "moderate":
        return "text-amber-600 bg-amber-100";
      case "low":
        return "text-green-600 bg-green-100";
    }
  };

  const getRiskIcon = (risk: AnalysisResult["overallRisk"]) => {
    switch (risk) {
      case "high":
        return <AlertTriangle className="w-4 h-4" />;
      case "moderate":
        return <AlertCircle className="w-4 h-4" />;
      case "low":
        return <CheckCircle className="w-4 h-4" />;
    }
  };

  if (state.asanas.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="bg-white rounded-xl shadow-xs border border-sage-100 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sage-600" />
            <span className="font-medium text-gray-700">Safety Check</span>
          </div>
          {isLoading ? (
            <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
          ) : analysis ? (
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${getRiskColor(
                  analysis.overallRisk
                )}`}
              >
                {getRiskIcon(analysis.overallRisk)}
                {analysis.overallRisk.charAt(0).toUpperCase() +
                  analysis.overallRisk.slice(1)}{" "}
                Risk
              </span>
              {analysis.alertCount > 0 && (
                <span className="text-sm text-gray-500">
                  {analysis.alertCount} alert{analysis.alertCount !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {analysis && analysis.alerts.length > 0 && (
          <div className="mt-3 space-y-2">
            {analysis.alerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className={`flex items-start gap-2 p-2 rounded-lg border ${getAlertStyles(
                  alert.type
                )}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800">
                    {alert.title}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {alert.message}
                  </p>
                </div>
              </div>
            ))}
            {analysis.alerts.length > 2 && (
              <p className="text-sm text-gray-500 text-center">
                +{analysis.alerts.length - 2} more alert
                {analysis.alerts.length - 2 !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-xs border border-sage-100 overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sage-100 rounded-lg">
            <Shield className="w-5 h-5 text-sage-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Safety Analysis</h3>
            <p className="text-sm text-gray-500">
              AI-powered injury prevention checks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            analysis && (
              <span
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full ${getRiskColor(
                  analysis.overallRisk
                )}`}
              >
                {getRiskIcon(analysis.overallRisk)}
                {analysis.overallRisk.charAt(0).toUpperCase() +
                  analysis.overallRisk.slice(1)}{" "}
                Risk
              </span>
            )
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && analysis && (
        <div className="border-t border-gray-100">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xl font-bold">
                  {analysis.summary.warnings}
                </span>
              </div>
              <p className="text-xs text-gray-500">Warnings</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-amber-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xl font-bold">
                  {analysis.summary.cautions}
                </span>
              </div>
              <p className="text-xs text-gray-500">Cautions</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <Lightbulb className="w-4 h-4" />
                <span className="text-xl font-bold">{analysis.summary.tips}</span>
              </div>
              <p className="text-xs text-gray-500">Tips</p>
            </div>
          </div>

          {/* Alerts List */}
          {analysis.alerts.length > 0 ? (
            <div className="p-4 space-y-3">
              {(showAllAlerts ? analysis.alerts : analysis.alerts.slice(0, 3)).map(
                (alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getAlertIcon(alert.type)}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">
                          {alert.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {alert.message}
                        </p>
                        {alert.affectedPoses && alert.affectedPoses.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {alert.affectedPoses.map((pose, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-0.5 bg-white/50 rounded-full text-gray-700"
                              >
                                {pose}
                              </span>
                            ))}
                          </div>
                        )}
                        {alert.suggestion && (
                          <p className="text-sm text-gray-700 mt-2 p-2 bg-white/50 rounded-lg">
                            <strong>Suggestion:</strong> {alert.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}

              {analysis.alerts.length > 3 && (
                <button
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="w-full py-2 text-sm text-sage-600 hover:text-sage-700 font-medium"
                >
                  {showAllAlerts
                    ? "Show less"
                    : `Show ${analysis.alerts.length - 3} more alert${
                        analysis.alerts.length - 3 !== 1 ? "s" : ""
                      }`}
                </button>
              )}
            </div>
          ) : (
            <div className="p-6 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
              <p className="font-medium text-gray-800">Sequence Looks Good!</p>
              <p className="text-sm text-gray-500 mt-1">
                No safety concerns detected in your current sequence.
              </p>
            </div>
          )}

          {/* Body Part Stress */}
          {showBodyMap && Object.keys(analysis.bodyPartStress).length > 0 && (
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-gray-600" />
                <h4 className="font-medium text-gray-700">Body Part Focus</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(analysis.bodyPartStress)
                  .sort(([, a], [, b]) => b - a)
                  .map(([part, count]) => (
                    <span
                      key={part}
                      className={`px-3 py-1 rounded-full text-sm ${
                        count >= 4
                          ? "bg-amber-100 text-amber-700"
                          : count >= 2
                          ? "bg-sage-100 text-sage-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {part}: {count}x
                    </span>
                  ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="p-4 border-t border-gray-100 bg-sage-50">
              <h4 className="font-medium text-gray-700 mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-sage-600">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

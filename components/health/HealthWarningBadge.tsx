"use client";

import { useState } from "react";
import {
  AlertTriangle,
  AlertOctagon,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export interface HealthWarning {
  asanaId: string;
  asanaName: string;
  conditionName: string;
  severity: "avoid" | "caution" | "modify";
  userSeverity: string | null;
  notes: string | null;
  modifications: {
    description: string;
    svgPath: string | null;
  }[];
}

interface HealthWarningBadgeProps {
  warnings: HealthWarning[];
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
  className?: string;
}

const SEVERITY_CONFIG = {
  avoid: {
    icon: AlertOctagon,
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    borderColor: "border-red-200",
    label: "Avoid",
    description: "Not recommended for your conditions",
  },
  caution: {
    icon: AlertTriangle,
    bgColor: "bg-amber-100",
    textColor: "text-amber-700",
    borderColor: "border-amber-200",
    label: "Caution",
    description: "Practice with care",
  },
  modify: {
    icon: Info,
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
    label: "Modify",
    description: "Modifications available",
  },
};

const SIZE_CONFIG = {
  sm: {
    badge: "px-2 py-0.5 text-xs",
    icon: "w-3 h-3",
  },
  md: {
    badge: "px-2.5 py-1 text-sm",
    icon: "w-4 h-4",
  },
  lg: {
    badge: "px-3 py-1.5 text-base",
    icon: "w-5 h-5",
  },
};

export default function HealthWarningBadge({
  warnings,
  size = "md",
  showDetails = true,
  className = "",
}: HealthWarningBadgeProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (warnings.length === 0) return null;

  // Get the most severe warning
  const severityOrder = ["avoid", "caution", "modify"];
  const sortedWarnings = [...warnings].sort(
    (a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity)
  );
  const mostSevere = sortedWarnings[0].severity;
  const config = SEVERITY_CONFIG[mostSevere];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  // Group warnings by severity
  const avoidWarnings = warnings.filter((w) => w.severity === "avoid");
  const cautionWarnings = warnings.filter((w) => w.severity === "caution");
  const modifyWarnings = warnings.filter((w) => w.severity === "modify");

  if (!showDetails) {
    // Simple badge only
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full font-medium ${config.bgColor} ${config.textColor} ${sizeConfig.badge} ${className}`}
      >
        <Icon className={sizeConfig.icon} />
        {config.label}
        {warnings.length > 1 && (
          <span className="opacity-75">+{warnings.length - 1}</span>
        )}
      </span>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Main badge - clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition-all ${config.bgColor} ${config.textColor} ${sizeConfig.badge} hover:opacity-90`}
      >
        <Icon className={sizeConfig.icon} />
        <span>{config.label}</span>
        {warnings.length > 1 && (
          <span className="opacity-75">({warnings.length})</span>
        )}
        {isExpanded ? (
          <ChevronUp className={sizeConfig.icon} />
        ) : (
          <ChevronDown className={sizeConfig.icon} />
        )}
      </button>

      {/* Expanded details */}
      {isExpanded && (
        <div
          className={`mt-2 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
        >
          {/* Avoid section */}
          {avoidWarnings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-2">
                <AlertOctagon className="w-4 h-4" />
                <span>Not Recommended</span>
              </div>
              <ul className="space-y-2">
                {avoidWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-red-600">
                    <span className="font-medium">{warning.conditionName}</span>
                    {warning.notes && (
                      <p className="mt-1 text-red-500">{warning.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caution section */}
          {cautionWarnings.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-amber-700 font-medium mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Practice with Caution</span>
              </div>
              <ul className="space-y-2">
                {cautionWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-amber-600">
                    <span className="font-medium">{warning.conditionName}</span>
                    {warning.notes && (
                      <p className="mt-1 text-amber-500">{warning.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modifications section */}
          {modifyWarnings.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                <Info className="w-4 h-4" />
                <span>Available Modifications</span>
              </div>
              <ul className="space-y-2">
                {modifyWarnings.map((warning, idx) => (
                  <li key={idx} className="text-sm text-blue-600">
                    <span className="font-medium">{warning.conditionName}</span>
                    {warning.modifications.length > 0 && (
                      <ul className="mt-1 ml-4 space-y-1">
                        {warning.modifications.map((mod, modIdx) => (
                          <li key={modIdx} className="text-blue-500">
                            • {mod.description}
                          </li>
                        ))}
                      </ul>
                    )}
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

// Compact inline badge for list views
export function HealthWarningIcon({
  warnings,
  className = "",
}: {
  warnings: HealthWarning[];
  className?: string;
}) {
  if (warnings.length === 0) return null;

  const hasAvoid = warnings.some((w) => w.severity === "avoid");
  const hasCaution = warnings.some((w) => w.severity === "caution");

  if (hasAvoid) {
    return (
      <span className={`text-red-500 ${className}`} title="Contraindicated for your conditions">
        <AlertOctagon className="w-4 h-4" />
      </span>
    );
  }

  if (hasCaution) {
    return (
      <span className={`text-amber-500 ${className}`} title="Practice with caution">
        <AlertTriangle className="w-4 h-4" />
      </span>
    );
  }

  return (
    <span className={`text-blue-500 ${className}`} title="Modifications available">
      <Info className="w-4 h-4" />
    </span>
  );
}

// Full warning card for detail pages
export function HealthWarningCard({
  warnings,
  onDismiss,
}: {
  warnings: HealthWarning[];
  onDismiss?: () => void;
}) {
  if (warnings.length === 0) return null;

  const hasAvoid = warnings.some((w) => w.severity === "avoid");
  const hasCaution = warnings.some((w) => w.severity === "caution");

  const bgColor = hasAvoid
    ? "bg-red-50 border-red-200"
    : hasCaution
    ? "bg-amber-50 border-amber-200"
    : "bg-blue-50 border-blue-200";

  const textColor = hasAvoid
    ? "text-red-800"
    : hasCaution
    ? "text-amber-800"
    : "text-blue-800";

  return (
    <div className={`rounded-xl border p-4 ${bgColor}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          {hasAvoid ? (
            <AlertOctagon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          ) : hasCaution ? (
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          ) : (
            <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h4 className={`font-medium ${textColor}`}>
              {hasAvoid
                ? "Health Warning"
                : hasCaution
                ? "Practice with Caution"
                : "Modifications Available"}
            </h4>
            <div className="mt-2 space-y-2">
              {warnings.map((warning, idx) => (
                <div key={idx} className="text-sm">
                  <p className={textColor}>
                    <span className="font-medium">{warning.conditionName}:</span>{" "}
                    {warning.notes || SEVERITY_CONFIG[warning.severity].description}
                  </p>
                  {warning.modifications.length > 0 && (
                    <ul className="mt-1 ml-4 opacity-75">
                      {warning.modifications.map((mod, modIdx) => (
                        <li key={modIdx}>• {mod.description}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`p-1 hover:bg-white/50 rounded ${textColor}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

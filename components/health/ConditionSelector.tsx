"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Check,
  X,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface Condition {
  id: string;
  name: string;
  description: string | null;
}

interface UserCondition {
  conditionId: string;
  severity: string | null;
  notes: string | null;
  isActive: boolean;
}

interface ConditionSelectorProps {
  selectedConditions: UserCondition[];
  onConditionsChange: (conditions: UserCondition[]) => void;
  showSeverity?: boolean;
  showNotes?: boolean;
}

const SEVERITY_OPTIONS = [
  { value: "mild", label: "Mild", color: "bg-yellow-100 text-yellow-800" },
  { value: "moderate", label: "Moderate", color: "bg-orange-100 text-orange-800" },
  { value: "severe", label: "Severe", color: "bg-red-100 text-red-800" },
];

export default function ConditionSelector({
  selectedConditions,
  onConditionsChange,
  showSeverity = true,
  showNotes = true,
}: ConditionSelectorProps) {
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCondition, setExpandedCondition] = useState<string | null>(null);

  useEffect(() => {
    fetchConditions();
  }, []);

  const fetchConditions = async () => {
    try {
      const response = await fetch("/api/conditions");
      if (response.ok) {
        const data = await response.json();
        setConditions(data);
      }
    } catch (error) {
      console.error("Failed to fetch conditions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredConditions = conditions.filter(
    (condition) =>
      condition.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      condition.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isSelected = (conditionId: string) =>
    selectedConditions.some((c) => c.conditionId === conditionId && c.isActive);

  const getSelectedCondition = (conditionId: string) =>
    selectedConditions.find((c) => c.conditionId === conditionId);

  const toggleCondition = (conditionId: string) => {
    const existing = getSelectedCondition(conditionId);

    if (existing) {
      // Toggle active state
      onConditionsChange(
        selectedConditions.map((c) =>
          c.conditionId === conditionId ? { ...c, isActive: !c.isActive } : c
        )
      );
    } else {
      // Add new condition
      onConditionsChange([
        ...selectedConditions,
        {
          conditionId,
          severity: null,
          notes: null,
          isActive: true,
        },
      ]);
    }
  };

  const updateConditionSeverity = (conditionId: string, severity: string | null) => {
    onConditionsChange(
      selectedConditions.map((c) =>
        c.conditionId === conditionId ? { ...c, severity } : c
      )
    );
  };

  const updateConditionNotes = (conditionId: string, notes: string) => {
    onConditionsChange(
      selectedConditions.map((c) =>
        c.conditionId === conditionId ? { ...c, notes: notes || null } : c
      )
    );
  };

  const toggleExpanded = (conditionId: string) => {
    setExpandedCondition(expandedCondition === conditionId ? null : conditionId);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded-lg" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const activeConditions = selectedConditions.filter((c) => c.isActive);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search conditions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-hidden"
        />
      </div>

      {/* Selected conditions summary */}
      {activeConditions.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">
                {activeConditions.length} condition{activeConditions.length !== 1 ? "s" : ""} selected
              </p>
              <p className="text-xs text-amber-600 mt-1">
                Poses with contraindications for these conditions will be flagged
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Conditions list */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredConditions.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No conditions found matching &quot;{searchQuery}&quot;
          </p>
        ) : (
          filteredConditions.map((condition) => {
            const selected = isSelected(condition.id);
            const userCondition = getSelectedCondition(condition.id);
            const isExpanded = expandedCondition === condition.id && selected;

            return (
              <div
                key={condition.id}
                className={`border rounded-lg transition-all ${
                  selected
                    ? "border-sage-500 bg-sage-50"
                    : "border-gray-200 hover:border-sage-300"
                }`}
              >
                {/* Main condition row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer"
                  onClick={() => toggleCondition(condition.id)}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      selected
                        ? "bg-sage-500 text-white"
                        : "border-2 border-gray-300"
                    }`}
                  >
                    {selected && <Check className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{condition.name}</p>
                    {condition.description && (
                      <p className="text-sm text-gray-500 truncate">
                        {condition.description}
                      </p>
                    )}
                  </div>

                  {selected && userCondition?.severity && (
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        SEVERITY_OPTIONS.find((s) => s.value === userCondition.severity)
                          ?.color || ""
                      }`}
                    >
                      {userCondition.severity}
                    </span>
                  )}

                  {selected && (showSeverity || showNotes) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpanded(condition.id);
                      }}
                      className="p-1 hover:bg-sage-100 rounded-sm"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>
                  )}
                </div>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-sage-200 pt-3">
                    {showSeverity && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Severity
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {SEVERITY_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() =>
                                updateConditionSeverity(
                                  condition.id,
                                  userCondition?.severity === option.value
                                    ? null
                                    : option.value
                                )
                              }
                              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                userCondition?.severity === option.value
                                  ? option.color
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {showNotes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Personal Notes
                        </label>
                        <textarea
                          value={userCondition?.notes || ""}
                          onChange={(e) =>
                            updateConditionNotes(condition.id, e.target.value)
                          }
                          placeholder="Add notes about your condition..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 outline-hidden text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Info message */}
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          Your health information is private and used only to personalize your yoga
          practice with appropriate warnings and modifications.
        </p>
      </div>
    </div>
  );
}

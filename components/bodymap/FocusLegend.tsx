"use client";

interface FocusLegendProps {
  frontFocus: number;
  backFocus: number;
  balanceScore: number;
}

export default function FocusLegend({
  frontFocus,
  backFocus,
  balanceScore,
}: FocusLegendProps) {
  const intensityLevels = [
    { label: "Not practiced", color: "bg-gray-200", range: "0%" },
    { label: "Light", color: "bg-green-100", range: "1-19%" },
    { label: "Moderate", color: "bg-green-200", range: "20-39%" },
    { label: "Good", color: "bg-green-300", range: "40-59%" },
    { label: "Strong", color: "bg-green-400", range: "60-79%" },
    { label: "Primary", color: "bg-green-500", range: "80-100%" },
  ];

  const getBalanceLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Good";
    if (score >= 50) return "Moderate";
    return "Needs attention";
  };

  const getBalanceColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div className="space-y-6">
      {/* Intensity Legend */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Focus Intensity
        </h4>
        <div className="grid grid-cols-2 gap-2">
          {intensityLevels.map((level) => (
            <div key={level.label} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded ${level.color}`} />
              <span className="text-xs text-gray-600">
                {level.label} ({level.range})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Front/Back Balance */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">
          Front/Back Balance
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Front ({frontFocus}%)</span>
            <span>Back ({backFocus}%)</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-blue-400 transition-all"
              style={{ width: `${frontFocus}%` }}
            />
            <div
              className="h-full bg-purple-400 transition-all"
              style={{ width: `${backFocus}%` }}
            />
          </div>
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-400" />
              <span className="text-gray-600">Front</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-purple-400" />
              <span className="text-gray-600">Back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Score */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Balance Score
        </h4>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-500 rounded-full transition-all"
                style={{ width: `${balanceScore}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <span className={`text-lg font-bold ${getBalanceColor(balanceScore)}`}>
              {balanceScore}%
            </span>
            <p className={`text-xs ${getBalanceColor(balanceScore)}`}>
              {getBalanceLabel(balanceScore)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

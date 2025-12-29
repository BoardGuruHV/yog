"use client";

import AsanaCard from "./AsanaCard";
import { Asana } from "@/types";
import { useHealth } from "@/context/HealthContext";

interface AsanaGridProps {
  asanas: Asana[];
  loading?: boolean;
}

export default function AsanaGrid({ asanas, loading = false }: AsanaGridProps) {
  const { getWarningForAsana } = useHealth();
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-2 h-2 rounded-full bg-gray-200" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (asanas.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🧘</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No asanas found
        </h3>
        <p className="text-gray-500">
          Try adjusting your filters or search terms
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {asanas.map((asana) => (
        <div key={asana.id}>
          <AsanaCard asana={asana} healthWarning={getWarningForAsana(asana.id)} />
        </div>
      ))}
    </div>
  );
}

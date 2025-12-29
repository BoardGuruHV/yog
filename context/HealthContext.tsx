"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";

interface HealthWarningInfo {
  isContraindicated: boolean;
  hasCaution: boolean;
}

interface HealthContextType {
  warningsMap: Record<string, HealthWarningInfo>;
  hasConditions: boolean;
  conditionCount: number;
  isLoading: boolean;
  refreshWarnings: () => Promise<void>;
  getWarningForAsana: (asanaId: string) => HealthWarningInfo | undefined;
}

const HealthContext = createContext<HealthContextType | null>(null);

export function HealthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [warningsMap, setWarningsMap] = useState<Record<string, HealthWarningInfo>>({});
  const [hasConditions, setHasConditions] = useState(false);
  const [conditionCount, setConditionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWarnings = async () => {
    if (status !== "authenticated" || !session?.user) {
      setWarningsMap({});
      setHasConditions(false);
      setConditionCount(0);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/asanas/health");
      if (response.ok) {
        const data = await response.json();

        if (data.warningsMap) {
          // Transform the API response to the simpler format
          const simplified: Record<string, HealthWarningInfo> = {};
          for (const [asanaId, info] of Object.entries(data.warningsMap)) {
            const warningInfo = info as { isContraindicated: boolean; hasCaution: boolean };
            simplified[asanaId] = {
              isContraindicated: warningInfo.isContraindicated,
              hasCaution: warningInfo.hasCaution,
            };
          }
          setWarningsMap(simplified);
        }

        setHasConditions(data.hasConditions || false);
        setConditionCount(data.conditionCount || 0);
      }
    } catch (error) {
      console.error("Failed to fetch health warnings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWarnings();
  }, [status, session?.user?.id]);

  const getWarningForAsana = (asanaId: string): HealthWarningInfo | undefined => {
    return warningsMap[asanaId];
  };

  return (
    <HealthContext.Provider
      value={{
        warningsMap,
        hasConditions,
        conditionCount,
        isLoading,
        refreshWarnings: fetchWarnings,
        getWarningForAsana,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);
  if (!context) {
    throw new Error("useHealth must be used within a HealthProvider");
  }
  return context;
}

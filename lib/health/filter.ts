import prisma from "@/lib/db";

export interface UserConditionWithDetails {
  id: string;
  conditionId: string;
  severity: string | null;
  notes: string | null;
  isActive: boolean;
  condition: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface AsanaWithContraindications {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  contraindications: {
    id: string;
    severity: string;
    notes: string | null;
    condition: {
      id: string;
      name: string;
    };
  }[];
  modifications: {
    id: string;
    description: string;
    svgPath: string | null;
    condition: {
      id: string;
      name: string;
    } | null;
  }[];
}

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

export interface FilteredAsana {
  asana: AsanaWithContraindications;
  warnings: HealthWarning[];
  isContraindicated: boolean;
  hasCaution: boolean;
  hasModifications: boolean;
}

/**
 * Get all active conditions for a user
 */
export async function getUserConditions(userId: string): Promise<UserConditionWithDetails[]> {
  const conditions = await prisma.userCondition.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      condition: {
        select: {
          id: true,
          name: true,
          description: true,
        },
      },
    },
  });

  return conditions;
}

/**
 * Get health warnings for a specific asana based on user conditions
 */
export function getAsanaWarnings(
  asana: AsanaWithContraindications,
  userConditions: UserConditionWithDetails[]
): HealthWarning[] {
  const warnings: HealthWarning[] = [];
  const userConditionIds = new Set(userConditions.map(uc => uc.conditionId));

  for (const contraindication of asana.contraindications) {
    if (userConditionIds.has(contraindication.condition.id)) {
      const userCondition = userConditions.find(
        uc => uc.conditionId === contraindication.condition.id
      );

      // Find applicable modifications for this condition
      const applicableModifications = asana.modifications
        .filter(mod => mod.condition?.id === contraindication.condition.id)
        .map(mod => ({
          description: mod.description,
          svgPath: mod.svgPath,
        }));

      warnings.push({
        asanaId: asana.id,
        asanaName: asana.nameEnglish,
        conditionName: contraindication.condition.name,
        severity: contraindication.severity as "avoid" | "caution" | "modify",
        userSeverity: userCondition?.severity || null,
        notes: contraindication.notes,
        modifications: applicableModifications,
      });
    }
  }

  return warnings;
}

/**
 * Filter asanas based on user health conditions
 */
export function filterAsanasByHealth(
  asanas: AsanaWithContraindications[],
  userConditions: UserConditionWithDetails[],
  options: {
    hideContraindicated?: boolean;
    showWarningsOnly?: boolean;
  } = {}
): FilteredAsana[] {
  const { hideContraindicated = false, showWarningsOnly = false } = options;

  const filteredAsanas: FilteredAsana[] = [];

  for (const asana of asanas) {
    const warnings = getAsanaWarnings(asana, userConditions);

    const isContraindicated = warnings.some(w => w.severity === "avoid");
    const hasCaution = warnings.some(w => w.severity === "caution");
    const hasModifications = warnings.some(w => w.modifications.length > 0);

    // Skip if contraindicated and we're hiding those
    if (hideContraindicated && isContraindicated) {
      continue;
    }

    // Skip if we only want warnings and there are none
    if (showWarningsOnly && warnings.length === 0) {
      continue;
    }

    filteredAsanas.push({
      asana,
      warnings,
      isContraindicated,
      hasCaution,
      hasModifications,
    });
  }

  return filteredAsanas;
}

/**
 * Get safe asanas for a user (no contraindications)
 */
export async function getSafeAsanasForUser(userId: string): Promise<string[]> {
  const userConditions = await getUserConditions(userId);
  const conditionIds = userConditions.map(uc => uc.conditionId);

  if (conditionIds.length === 0) {
    // No conditions, all asanas are safe
    const allAsanas = await prisma.asana.findMany({
      select: { id: true },
    });
    return allAsanas.map(a => a.id);
  }

  // Find asanas that have "avoid" contraindications for user's conditions
  const contraindicatedAsanas = await prisma.contraindication.findMany({
    where: {
      conditionId: { in: conditionIds },
      severity: "avoid",
    },
    select: { asanaId: true },
  });

  const contraindicatedIds = new Set(contraindicatedAsanas.map(c => c.asanaId));

  // Get all asanas except contraindicated ones
  const safeAsanas = await prisma.asana.findMany({
    where: {
      id: { notIn: Array.from(contraindicatedIds) },
    },
    select: { id: true },
  });

  return safeAsanas.map(a => a.id);
}

/**
 * Check if a specific asana is safe for a user
 */
export async function isAsanaSafeForUser(
  asanaId: string,
  userId: string
): Promise<{ safe: boolean; warnings: HealthWarning[] }> {
  const userConditions = await getUserConditions(userId);

  if (userConditions.length === 0) {
    return { safe: true, warnings: [] };
  }

  const asana = await prisma.asana.findUnique({
    where: { id: asanaId },
    include: {
      contraindications: {
        include: {
          condition: {
            select: { id: true, name: true },
          },
        },
      },
      modifications: {
        include: {
          condition: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!asana) {
    return { safe: true, warnings: [] };
  }

  const warnings = getAsanaWarnings(asana as AsanaWithContraindications, userConditions);
  const safe = !warnings.some(w => w.severity === "avoid");

  return { safe, warnings };
}

/**
 * Get recommended modifications for a user's conditions
 */
export async function getModificationsForUser(
  asanaId: string,
  userId: string
): Promise<{ description: string; svgPath: string | null; forCondition: string }[]> {
  const userConditions = await getUserConditions(userId);

  if (userConditions.length === 0) {
    return [];
  }

  const conditionIds = userConditions.map(uc => uc.conditionId);

  const modifications = await prisma.modification.findMany({
    where: {
      asanaId,
      conditionId: { in: conditionIds },
    },
    include: {
      condition: {
        select: { name: true },
      },
    },
  });

  return modifications.map(mod => ({
    description: mod.description,
    svgPath: mod.svgPath,
    forCondition: mod.condition?.name || "General",
  }));
}

/**
 * Severity priority for sorting warnings
 */
const SEVERITY_PRIORITY: Record<string, number> = {
  avoid: 3,
  caution: 2,
  modify: 1,
};

/**
 * Sort warnings by severity (most severe first)
 */
export function sortWarningsBySeverity(warnings: HealthWarning[]): HealthWarning[] {
  return [...warnings].sort((a, b) => {
    return (SEVERITY_PRIORITY[b.severity] || 0) - (SEVERITY_PRIORITY[a.severity] || 0);
  });
}

/**
 * Get summary of health warnings for display
 */
export function getWarningsSummary(warnings: HealthWarning[]): {
  avoidCount: number;
  cautionCount: number;
  modifyCount: number;
  totalCount: number;
  mostSevere: "avoid" | "caution" | "modify" | null;
} {
  const avoidCount = warnings.filter(w => w.severity === "avoid").length;
  const cautionCount = warnings.filter(w => w.severity === "caution").length;
  const modifyCount = warnings.filter(w => w.severity === "modify").length;

  let mostSevere: "avoid" | "caution" | "modify" | null = null;
  if (avoidCount > 0) mostSevere = "avoid";
  else if (cautionCount > 0) mostSevere = "caution";
  else if (modifyCount > 0) mostSevere = "modify";

  return {
    avoidCount,
    cautionCount,
    modifyCount,
    totalCount: warnings.length,
    mostSevere,
  };
}

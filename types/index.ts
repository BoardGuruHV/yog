export type Category =
  | "STANDING"
  | "SEATED"
  | "PRONE"
  | "SUPINE"
  | "INVERSION"
  | "BALANCE"
  | "TWIST"
  | "FORWARD_BEND"
  | "BACK_BEND";

export interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  description: string;
  category: Category;
  difficulty: number;
  durationSeconds: number;
  benefits: string[];
  targetBodyParts: string[];
  svgPath: string;
  contraindications?: Contraindication[];
  modifications?: Modification[];
}

export interface Condition {
  id: string;
  name: string;
  description?: string;
}

export interface Contraindication {
  id: string;
  asanaId: string;
  conditionId: string;
  condition?: Condition;
  severity: "avoid" | "caution" | "modify";
  notes?: string;
}

export interface Modification {
  id: string;
  asanaId: string;
  conditionId?: string;
  condition?: Condition;
  forAge?: string;
  description: string;
  svgPath?: string;
}

export interface Program {
  id: string;
  name: string;
  description?: string;
  totalDuration: number;
  asanas: ProgramAsana[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgramAsana {
  id: string;
  programId: string;
  asanaId: string;
  asana?: Asana;
  order: number;
  duration: number;
  notes?: string;
}

export interface FilterState {
  categories: Category[];
  difficulty: number[];
  bodyParts: string[];
  search: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  STANDING: "Standing",
  SEATED: "Seated",
  PRONE: "Prone",
  SUPINE: "Supine",
  INVERSION: "Inversion",
  BALANCE: "Balance",
  TWIST: "Twist",
  FORWARD_BEND: "Forward Bend",
  BACK_BEND: "Back Bend",
};

export const CATEGORY_COLORS: Record<Category, string> = {
  STANDING: "bg-blue-100 text-blue-700",
  SEATED: "bg-purple-100 text-purple-700",
  PRONE: "bg-amber-100 text-amber-700",
  SUPINE: "bg-teal-100 text-teal-700",
  INVERSION: "bg-red-100 text-red-700",
  BALANCE: "bg-indigo-100 text-indigo-700",
  TWIST: "bg-pink-100 text-pink-700",
  FORWARD_BEND: "bg-emerald-100 text-emerald-700",
  BACK_BEND: "bg-orange-100 text-orange-700",
};

export const BODY_PARTS = [
  "back",
  "core",
  "hamstrings",
  "hips",
  "shoulders",
  "chest",
  "legs",
  "arms",
  "spine",
  "neck",
  "glutes",
  "ankles",
  "wrists",
] as const;

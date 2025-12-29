import { Asana, Category } from "@/types";

export interface TemplateAsanaData {
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
}

export interface TemplateAsana {
  asanaId: string;
  duration: number;
  notes?: string;
  asana?: TemplateAsanaData | null;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  duration: number;
  difficulty: number;
  goals: string[];
  icon?: string;
  featured: boolean;
  asanaSequence: TemplateAsana[];
}

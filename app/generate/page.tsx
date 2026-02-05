import { Sparkles } from "lucide-react";
import ProgramWizard from "@/components/wizard/ProgramWizard";

export const metadata = {
  title: "Generate AI Program - Yog",
  description: "Create a personalized yoga program with AI",
};

export default function GeneratePage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-sage-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sage-100 text-sage-700 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Create Your Perfect Yoga Program
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tell us about your goals and preferences, and our AI will craft a
            personalized yoga sequence just for you.
          </p>
        </div>

        {/* Wizard */}
        <ProgramWizard />
      </div>
    </div>
  );
}

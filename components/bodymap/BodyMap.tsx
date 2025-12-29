"use client";

import { useState, useEffect, useRef } from "react";
import BodyPart from "./BodyPart";
import FocusLegend from "./FocusLegend";
import { getIntensityColor } from "@/lib/bodymap/analyzer";

interface TopPose {
  id: string;
  name: string;
  count: number;
}

interface BodyPartData {
  id: string;
  label: string;
  side: string;
  practiceCount: number;
  percentage: number;
  intensity: number;
  lastPracticed: string | null;
  topPoses: TopPose[];
}

interface BodyMapProps {
  bodyParts: Record<string, BodyPartData>;
  totalPractices: number;
  balanceScore: number;
  frontFocus: number;
  backFocus: number;
  recommendations: string[];
}

// Map body part IDs to SVG element IDs
const FRONT_PARTS = [
  "neck",
  "shoulders",
  "chest",
  "core",
  "arms-left",
  "arms-right",
  "wrists-left",
  "wrists-right",
  "hips",
  "quadriceps-left",
  "quadriceps-right",
  "knees-left",
  "knees-right",
  "shins-left",
  "shins-right",
  "ankles-left",
  "ankles-right",
];

const BACK_PARTS = [
  "neck-back",
  "upper_back",
  "spine",
  "arms-back-left",
  "arms-back-right",
  "lower_back",
  "glutes",
  "hamstrings-left",
  "hamstrings-right",
  "knees-back-left",
  "knees-back-right",
  "calves-left",
  "calves-right",
  "ankles-back-left",
  "ankles-back-right",
];

// Map SVG element IDs to body part data IDs
const SVG_TO_DATA_MAP: Record<string, string> = {
  // Front
  neck: "neck",
  shoulders: "shoulders",
  chest: "chest",
  core: "core",
  "arms-left": "arms",
  "arms-right": "arms",
  "wrists-left": "wrists",
  "wrists-right": "wrists",
  hips: "hips",
  "quadriceps-left": "quadriceps",
  "quadriceps-right": "quadriceps",
  "knees-left": "knees",
  "knees-right": "knees",
  "shins-left": "quadriceps",
  "shins-right": "quadriceps",
  "ankles-left": "ankles",
  "ankles-right": "ankles",
  // Back
  "neck-back": "neck",
  upper_back: "upper_back",
  spine: "spine",
  "arms-back-left": "arms",
  "arms-back-right": "arms",
  lower_back: "lower_back",
  glutes: "glutes",
  "hamstrings-left": "hamstrings",
  "hamstrings-right": "hamstrings",
  "knees-back-left": "knees",
  "knees-back-right": "knees",
  "calves-left": "calves",
  "calves-right": "calves",
  "ankles-back-left": "ankles",
  "ankles-back-right": "ankles",
};

export default function BodyMap({
  bodyParts,
  totalPractices,
  balanceScore,
  frontFocus,
  backFocus,
  recommendations,
}: BodyMapProps) {
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const frontSvgRef = useRef<HTMLDivElement>(null);
  const backSvgRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Apply colors to SVG elements
  useEffect(() => {
    const applyColors = (
      containerRef: React.RefObject<HTMLDivElement | null>,
      parts: string[]
    ) => {
      if (!containerRef.current) return;

      const svg = containerRef.current.querySelector("svg");
      if (!svg) return;

      parts.forEach((partId) => {
        const element = svg.querySelector(`#${partId}`);
        if (element) {
          const dataId = SVG_TO_DATA_MAP[partId];
          const partData = bodyParts[dataId];
          if (partData) {
            const color = getIntensityColor(partData.intensity);
            element.setAttribute("fill", color);
            element.setAttribute("cursor", "pointer");
            element.classList.add("transition-all", "duration-200");

            // Add hover effect
            element.addEventListener("mouseenter", () => {
              element.setAttribute("opacity", "0.8");
            });
            element.addEventListener("mouseleave", () => {
              element.setAttribute("opacity", "1");
            });
          }
        }
      });
    };

    applyColors(frontSvgRef, FRONT_PARTS);
    applyColors(backSvgRef, BACK_PARTS);
  }, [bodyParts]);

  // Handle clicks on SVG elements
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as SVGElement;
      const partId = target.id;

      if (partId && SVG_TO_DATA_MAP[partId]) {
        const dataId = SVG_TO_DATA_MAP[partId];
        setSelectedPart(dataId);

        // Calculate popup position
        if (containerRef.current) {
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setPopupPosition({ x, y });
        }
      }
    };

    const frontSvg = frontSvgRef.current?.querySelector("svg");
    const backSvg = backSvgRef.current?.querySelector("svg");

    frontSvg?.addEventListener("click", handleClick);
    backSvg?.addEventListener("click", handleClick);

    return () => {
      frontSvg?.removeEventListener("click", handleClick);
      backSvg?.removeEventListener("click", handleClick);
    };
  }, []);

  const selectedPartData = selectedPart ? bodyParts[selectedPart] : null;

  return (
    <div ref={containerRef} className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Body Maps */}
        <div className="lg:col-span-2">
          <div className="flex flex-col sm:flex-row justify-center gap-8">
            {/* Front View */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Front View
              </h3>
              <div
                ref={frontSvgRef}
                className="w-48 h-auto"
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" fill="none" class="w-full h-auto">
  <!-- Head (not interactive) -->
  <ellipse cx="100" cy="30" rx="25" ry="28" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Neck -->
  <path id="neck" d="M90 55 L90 70 L110 70 L110 55 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Shoulders -->
  <path id="shoulders" d="M50 75 L90 70 L110 70 L150 75 L150 90 L110 85 L90 85 L50 90 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Chest -->
  <path id="chest" d="M65 90 L90 85 L110 85 L135 90 L135 130 L100 135 L65 130 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Arms (left) -->
  <path id="arms-left" d="M50 75 L50 90 L35 130 L25 170 L30 175 L45 135 L55 100 L65 90 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Arms (right) -->
  <path id="arms-right" d="M150 75 L150 90 L165 130 L175 170 L170 175 L155 135 L145 100 L135 90 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Wrists (left) -->
  <path id="wrists-left" d="M25 170 L20 195 L30 200 L35 175 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Wrists (right) -->
  <path id="wrists-right" d="M175 170 L180 195 L170 200 L165 175 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Core/Abs -->
  <path id="core" d="M70 130 L100 135 L130 130 L130 190 L100 195 L70 190 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Hips -->
  <path id="hips" d="M65 190 L70 190 L100 195 L130 190 L135 190 L140 220 L100 230 L60 220 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Quadriceps (left) -->
  <path id="quadriceps-left" d="M60 220 L75 225 L80 290 L65 290 L55 250 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Quadriceps (right) -->
  <path id="quadriceps-right" d="M140 220 L125 225 L120 290 L135 290 L145 250 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Knees (left) -->
  <ellipse id="knees-left" cx="72" cy="300" rx="12" ry="15" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Knees (right) -->
  <ellipse id="knees-right" cx="128" cy="300" rx="12" ry="15" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Lower legs/Shins (left) -->
  <path id="shins-left" d="M65 315 L80 315 L78 370 L67 370 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Lower legs/Shins (right) -->
  <path id="shins-right" d="M120 315 L135 315 L133 370 L122 370 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Ankles (left) -->
  <ellipse id="ankles-left" cx="72" cy="378" rx="10" ry="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Ankles (right) -->
  <ellipse id="ankles-right" cx="128" cy="378" rx="10" ry="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>
</svg>`,
                }}
              />
            </div>

            {/* Back View */}
            <div className="flex flex-col items-center">
              <h3 className="text-sm font-medium text-gray-600 mb-3">
                Back View
              </h3>
              <div
                ref={backSvgRef}
                className="w-48 h-auto"
                dangerouslySetInnerHTML={{
                  __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 400" fill="none" class="w-full h-auto">
  <!-- Head (not interactive) -->
  <ellipse cx="100" cy="30" rx="25" ry="28" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Neck (back) -->
  <path id="neck-back" d="M90 55 L90 70 L110 70 L110 55 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Upper Back / Shoulders -->
  <path id="upper_back" d="M50 75 L90 70 L110 70 L150 75 L145 130 L100 135 L55 130 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Spine -->
  <path id="spine" d="M95 70 L105 70 L105 190 L95 190 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Arms (left back) -->
  <path id="arms-back-left" d="M50 75 L50 90 L35 130 L25 170 L30 175 L45 135 L55 100 L55 130 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Arms (right back) -->
  <path id="arms-back-right" d="M150 75 L150 90 L165 130 L175 170 L170 175 L155 135 L145 100 L145 130 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Lower Back -->
  <path id="lower_back" d="M65 130 L95 135 L105 135 L135 130 L135 190 L100 195 L65 190 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Glutes -->
  <path id="glutes" d="M60 190 L100 195 L140 190 L145 230 L100 240 L55 230 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Hamstrings (left) -->
  <path id="hamstrings-left" d="M55 230 L80 235 L82 290 L60 290 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Hamstrings (right) -->
  <path id="hamstrings-right" d="M145 230 L120 235 L118 290 L140 290 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Knees (back left) -->
  <ellipse id="knees-back-left" cx="72" cy="300" rx="12" ry="15" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Knees (back right) -->
  <ellipse id="knees-back-right" cx="128" cy="300" rx="12" ry="15" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Calves (left) -->
  <path id="calves-left" d="M60 315 L82 315 L80 370 L62 370 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Calves (right) -->
  <path id="calves-right" d="M118 315 L140 315 L138 370 L120 370 Z" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Ankles (back left) -->
  <ellipse id="ankles-back-left" cx="72" cy="378" rx="10" ry="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>

  <!-- Ankles (back right) -->
  <ellipse id="ankles-back-right" cx="128" cy="378" rx="10" ry="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="1"/>
</svg>`,
                }}
              />
            </div>
          </div>

          {/* Instructions */}
          <p className="text-center text-sm text-gray-500 mt-4">
            Click on any body part to see details
          </p>

          {/* Stats Summary */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{totalPractices}</p>
              <p className="text-xs text-gray-500">Total Practices</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-gray-900">{balanceScore}%</p>
              <p className="text-xs text-gray-500">Balance Score</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-600">{frontFocus}%</p>
              <p className="text-xs text-gray-500">Front Focus</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">{backFocus}%</p>
              <p className="text-xs text-gray-500">Back Focus</p>
            </div>
          </div>
        </div>

        {/* Legend & Recommendations */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <FocusLegend
              frontFocus={frontFocus}
              backFocus={backFocus}
              balanceScore={balanceScore}
            />
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-amber-800 mb-3">
                Recommendations
              </h4>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-amber-700 flex gap-2">
                    <span className="text-amber-500">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Body Part Detail Popup */}
      {selectedPart && selectedPartData && (
        <div
          className="absolute z-50 w-72"
          style={{
            left: Math.min(popupPosition.x, window.innerWidth - 300),
            top: popupPosition.y + 10,
          }}
        >
          <BodyPart
            id={selectedPartData.id}
            label={selectedPartData.label}
            practiceCount={selectedPartData.practiceCount}
            percentage={selectedPartData.percentage}
            intensity={selectedPartData.intensity}
            lastPracticed={selectedPartData.lastPracticed}
            topPoses={selectedPartData.topPoses}
            onClose={() => setSelectedPart(null)}
          />
        </div>
      )}

      {/* Backdrop for popup */}
      {selectedPart && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}

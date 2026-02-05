"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, ChevronDown } from "lucide-react";
import Image from "next/image";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
}

interface PoseSelectorProps {
  label: string;
  selectedAsana: Asana | null;
  onSelect: (asana: Asana | null) => void;
  excludeId?: string; // Exclude this ID from results (the other selected pose)
}

export default function PoseSelector({
  label,
  selectedAsana,
  onSelect,
  excludeId,
}: PoseSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [asanas, setAsanas] = useState<Asana[]>([]);
  const [filteredAsanas, setFilteredAsanas] = useState<Asana[]>([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAsanas();
  }, []);

  useEffect(() => {
    // Filter asanas based on search and exclude ID
    let filtered = asanas;

    if (excludeId) {
      filtered = filtered.filter((a) => a.id !== excludeId);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nameEnglish.toLowerCase().includes(searchLower) ||
          a.nameSanskrit.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAsanas(filtered);
  }, [search, asanas, excludeId]);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchAsanas = async () => {
    try {
      const res = await fetch("/api/asanas");
      if (res.ok) {
        const data = await res.json();
        setAsanas(data);
      }
    } catch (error) {
      console.error("Error fetching asanas:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (asana: Asana) => {
    onSelect(asana);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onSelect(null);
    setSearch("");
  };

  const getDifficultyLabel = (difficulty: number) => {
    const labels = ["", "Beginner", "Easy", "Moderate", "Challenging", "Advanced"];
    return labels[difficulty] || "";
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      {selectedAsana ? (
        // Selected pose display
        <div className="bg-white rounded-xl border-2 border-sage-200 p-4 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-sage-50 rounded-lg flex items-center justify-center shrink-0">
              <Image
                src={selectedAsana.svgPath}
                alt={selectedAsana.nameEnglish}
                width={60}
                height={60}
                className="object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {selectedAsana.nameEnglish}
              </h3>
              <p className="text-sm text-sage-600 italic truncate">
                {selectedAsana.nameSanskrit}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {getDifficultyLabel(selectedAsana.difficulty)}
              </p>
            </div>
            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        // Selector button
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-6 hover:border-sage-400 hover:bg-sage-50/50 transition-all text-left"
        >
          <div className="flex items-center justify-center gap-3 text-gray-500">
            <Search className="w-5 h-5" />
            <span>Select a pose to compare</span>
            <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </div>
        </button>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl max-h-96 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search poses..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-sage-500 focus:border-transparent text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          <div className="overflow-y-auto max-h-72">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredAsanas.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No poses found</div>
            ) : (
              filteredAsanas.map((asana) => (
                <button
                  key={asana.id}
                  onClick={() => handleSelect(asana)}
                  className="w-full p-3 hover:bg-sage-50 transition-colors flex items-center gap-3 text-left border-b border-gray-50 last:border-0"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center shrink-0">
                    <Image
                      src={asana.svgPath}
                      alt={asana.nameEnglish}
                      width={36}
                      height={36}
                      className="object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {asana.nameEnglish}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {asana.nameSanskrit}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 capitalize">
                    {asana.category.toLowerCase().replace("_", " ")}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

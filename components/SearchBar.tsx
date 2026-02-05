"use client";

import { Search, X } from "lucide-react";
import { useState, useEffect, useCallback } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Search asanas...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Debounced search
  const debouncedSearch = useCallback(
    (value: string) => {
      const timer = setTimeout(() => {
        onSearch(value);
      }, 300);
      return () => clearTimeout(timer);
    },
    [onSearch]
  );

  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  const handleClear = () => {
    setQuery("");
    onSearch("");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-10 pr-10 py-2.5 border border-sage-200 rounded-xl bg-white focus:ring-2 focus:ring-sage-400 focus:border-transparent outline-hidden transition-all text-gray-700 placeholder-gray-400"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
        </button>
      )}
    </div>
  );
}

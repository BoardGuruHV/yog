"use client";

import Link from "next/link";
import { Clock, Star, ArrowRight } from "lucide-react";

interface ArticleCardProps {
  slug: string;
  title: string;
  subtitle?: string | null;
  category: string;
  excerpt?: string | null;
  coverImage?: string | null;
  readTime: number;
  tags: string[];
  featured?: boolean;
  compact?: boolean;
}

const CATEGORY_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  philosophy: { bg: "bg-purple-100", text: "text-purple-700", icon: "🕉️" },
  history: { bg: "bg-amber-100", text: "text-amber-700", icon: "📜" },
  anatomy: { bg: "bg-emerald-100", text: "text-emerald-700", icon: "🫀" },
  lifestyle: { bg: "bg-blue-100", text: "text-blue-700", icon: "🌿" },
  practice: { bg: "bg-rose-100", text: "text-rose-700", icon: "🧘" },
};

export default function ArticleCard({
  slug,
  title,
  subtitle,
  category,
  excerpt,
  coverImage,
  readTime,
  tags,
  featured,
  compact = false,
}: ArticleCardProps) {
  const categoryStyle = CATEGORY_STYLES[category] || CATEGORY_STYLES.philosophy;

  if (compact) {
    return (
      <Link
        href={`/learn/articles/${slug}`}
        className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-sage-200 hover:shadow-md transition-all group"
      >
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl ${categoryStyle.bg}`}>
            {categoryStyle.icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-sage-700 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded ${categoryStyle.bg} ${categoryStyle.text}`}>
              {category}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {readTime} min
            </span>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-sage-600 group-hover:translate-x-1 transition-all" />
      </Link>
    );
  }

  return (
    <Link
      href={`/learn/articles/${slug}`}
      className="block bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-sage-200 hover:shadow-lg transition-all group"
    >
      {/* Cover Image or Placeholder */}
      <div className="h-48 relative overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center ${categoryStyle.bg}`}>
            <span className="text-6xl">{categoryStyle.icon}</span>
          </div>
        )}

        {/* Featured badge */}
        {featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-amber-500 text-white rounded-full text-xs font-medium">
            <Star className="w-3 h-3 fill-current" />
            Featured
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-3 left-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryStyle.bg} ${categoryStyle.text} capitalize`}>
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1 group-hover:text-sage-700 transition-colors line-clamp-2">
          {title}
        </h3>

        {subtitle && (
          <p className="text-sm text-sage-600 mb-2">{subtitle}</p>
        )}

        {excerpt && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-4">
            {excerpt}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readTime} min read
          </span>

          <span className="text-sage-600 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Read more
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-gray-100">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
              >
                {tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="text-xs text-gray-400">+{tags.length - 3} more</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

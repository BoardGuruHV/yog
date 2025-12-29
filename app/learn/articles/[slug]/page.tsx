"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Tag,
  Share2,
  BookOpen,
  Loader2,
  ChevronRight,
} from "lucide-react";
import ArticleContent, {
  ReadingProgress,
  TableOfContents,
} from "@/components/learn/ArticleContent";
import ArticleCard from "@/components/learn/ArticleCard";

interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  category: string;
  content: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
  tags: string[];
  featured: boolean;
  publishedAt: string;
}

interface RelatedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  readTime: number;
}

const CATEGORY_INFO: Record<string, { label: string; icon: string; color: string }> = {
  philosophy: { label: "Philosophy", icon: "🕉️", color: "purple" },
  history: { label: "History", icon: "📜", color: "amber" },
  anatomy: { label: "Anatomy", icon: "🫀", color: "emerald" },
  lifestyle: { label: "Lifestyle", icon: "🌿", color: "blue" },
  practice: { label: "Practice", icon: "🧘", color: "rose" },
};

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchArticle();
    }
  }, [slug]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/articles/${slug}`);
      if (!res.ok) {
        if (res.status === 404) {
          setError("Article not found");
        } else {
          setError("Failed to load article");
        }
        return;
      }
      const data = await res.json();
      setArticle(data.article);
      setRelatedArticles(data.relatedArticles || []);
    } catch (err) {
      setError("Failed to load article");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt || "",
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {error || "Article not found"}
        </h1>
        <p className="text-gray-600 mb-6">
          The article you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/learn"
          className="flex items-center gap-2 px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Hub
        </Link>
      </div>
    );
  }

  const categoryInfo = CATEGORY_INFO[article.category] || CATEGORY_INFO.philosophy;

  return (
    <>
      <ReadingProgress />

      <article className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-purple-200 text-sm mb-6">
              <Link href="/learn" className="hover:text-white transition-colors">
                Learn
              </Link>
              <ChevronRight className="w-4 h-4" />
              <Link
                href={`/learn?category=${article.category}`}
                className="hover:text-white transition-colors capitalize"
              >
                {categoryInfo.label}
              </Link>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white truncate max-w-[200px]">
                {article.title}
              </span>
            </nav>

            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{categoryInfo.icon}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium capitalize">
                {categoryInfo.label}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {article.title}
            </h1>

            {/* Subtitle */}
            {article.subtitle && (
              <p className="text-xl text-purple-200 mb-6">{article.subtitle}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-purple-200">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {article.readTime} min read
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(article.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 hover:text-white transition-colors ml-auto"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative -mt-6 mx-4 sm:mx-6 lg:mx-8">
            <div className="max-w-4xl mx-auto">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Table of Contents */}
            <aside className="lg:col-span-1 order-2 lg:order-1">
              <div className="sticky top-8">
                <TableOfContents content={article.content} />

                {/* Tags */}
                {article.tags.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Link
                          key={tag}
                          href={`/learn?tag=${tag}`}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                        >
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3 order-1 lg:order-2">
              <ArticleContent content={article.content} />
            </main>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedArticles.map((related) => (
                  <ArticleCard
                    key={related.id}
                    slug={related.slug}
                    title={related.title}
                    category={article.category}
                    excerpt={related.excerpt}
                    coverImage={related.coverImage}
                    readTime={related.readTime}
                    tags={[]}
                    compact
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Back to Hub */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/learn"
            className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Learning Hub
          </Link>
        </div>
      </article>
    </>
  );
}

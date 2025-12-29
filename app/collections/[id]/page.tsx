"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Folder,
  ArrowLeft,
  Loader2,
  Trash2,
  Play,
  Heart,
} from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
}

interface CollectionAsana {
  id: string;
  order: number;
  asana: Asana;
}

interface Collection {
  id: string;
  name: string;
  description: string | null;
  asanaCount: number;
  asanas: CollectionAsana[];
  createdAt: string;
  updatedAt: string;
}

const DIFFICULTY_LABELS = ["Beginner", "Easy", "Moderate", "Challenging", "Advanced"];

export default function CollectionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/collections");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user && collectionId) {
      fetchCollection();
    }
  }, [session, collectionId]);

  const fetchCollection = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        const found = data.collections?.find(
          (c: Collection) => c.id === collectionId
        );
        if (found) {
          setCollection(found);
        } else {
          router.push("/collections");
        }
      }
    } catch (error) {
      console.error("Error fetching collection:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAsana = async (asanaId: string) => {
    if (!collection) return;

    try {
      const res = await fetch(
        `/api/collections/asanas?collectionId=${collection.id}&asanaId=${asanaId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        setCollection((prev) =>
          prev
            ? {
                ...prev,
                asanaCount: prev.asanaCount - 1,
                asanas: prev.asanas.filter((a) => a.asana.id !== asanaId),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error removing asana:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session || !collection) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/collections"
            className="inline-flex items-center gap-2 text-sage-200 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Collections
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Folder className="w-8 h-8" />
                {collection.name}
              </h1>
              {collection.description && (
                <p className="text-sage-200 mt-2">{collection.description}</p>
              )}
              <p className="text-sage-300 mt-2">
                {collection.asanaCount} asana
                {collection.asanaCount !== 1 ? "s" : ""}
              </p>
            </div>
            {collection.asanas.length > 0 && (
              <Link
                href={`/program?from=collection&id=${collection.id}`}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Play className="w-5 h-5" />
                <span className="hidden sm:inline">Create Program</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {collection.asanas.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-10 h-10 text-sage-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Empty Collection
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              This collection doesn&apos;t have any asanas yet. Browse the library
              and add some!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            >
              Browse Asanas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collection.asanas.map((ca) => (
              <div
                key={ca.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <Link href={`/asana/${ca.asana.id}`}>
                  <div className="aspect-square bg-gradient-to-br from-sage-50 to-white p-4 relative">
                    <img
                      src={ca.asana.svgPath}
                      alt={ca.asana.nameEnglish}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2">
                      <FavoriteButton asanaId={ca.asana.id} size="sm" />
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/asana/${ca.asana.id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-sage-600 transition-colors">
                      {ca.asana.nameEnglish}
                    </h3>
                    <p className="text-sm text-gray-500 italic">
                      {ca.asana.nameSanskrit}
                    </p>
                  </Link>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs bg-sage-100 text-sage-700 rounded-full">
                      {ca.asana.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {DIFFICULTY_LABELS[ca.asana.difficulty - 1]}
                    </span>
                  </div>

                  <button
                    onClick={() => handleRemoveAsana(ca.asana.id)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove from Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Loader2,
  HeartOff,
  FolderPlus,
  ChevronRight,
} from "lucide-react";
import FavoriteButton from "@/components/favorites/FavoriteButton";
import AddToCollectionModal from "@/components/collections/AddToCollectionModal";

interface Asana {
  id: string;
  nameEnglish: string;
  nameSanskrit: string;
  category: string;
  difficulty: number;
  svgPath: string;
  benefits: string[];
  targetBodyParts: string[];
}

interface Favorite {
  id: string;
  asanaId: string;
  createdAt: string;
  asana: Asana;
}

const DIFFICULTY_LABELS = ["Beginner", "Easy", "Moderate", "Challenging", "Advanced"];

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsana, setSelectedAsana] = useState<Asana | null>(null);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/favorites");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFavorites();
    }
  }, [session]);

  const fetchFavorites = async () => {
    try {
      const res = await fetch("/api/favorites");
      if (res.ok) {
        const data = await res.json();
        setFavorites(data.favorites || []);
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (asanaId: string) => {
    setFavorites((prev) => prev.filter((f) => f.asanaId !== asanaId));
  };

  const handleAddToCollection = (asana: Asana) => {
    setSelectedAsana(asana);
    setShowCollectionModal(true);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-600 animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-red-500 to-red-600 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Heart className="w-8 h-8" />
                My Favorites
              </h1>
              <p className="text-red-100 mt-2">
                {favorites.length} asana{favorites.length !== 1 ? "s" : ""} saved
              </p>
            </div>
            <Link
              href="/collections"
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <span className="hidden sm:inline">Collections</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <HeartOff className="w-10 h-10 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Favorites Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Start exploring asanas and click the heart icon to add them to
              your favorites!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            >
              Browse Asanas
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <div
                key={favorite.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <Link href={`/asana/${favorite.asana.id}`}>
                  <div className="aspect-square bg-gradient-to-br from-sage-50 to-white p-4 relative">
                    <img
                      src={favorite.asana.svgPath}
                      alt={favorite.asana.nameEnglish}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <FavoriteButton
                        asanaId={favorite.asanaId}
                        initialFavorited={true}
                        size="sm"
                        onToggle={(isFav) => {
                          if (!isFav) handleRemove(favorite.asanaId);
                        }}
                      />
                    </div>
                  </div>
                </Link>

                {/* Content */}
                <div className="p-4">
                  <Link href={`/asana/${favorite.asana.id}`}>
                    <h3 className="font-semibold text-gray-800 hover:text-sage-600 transition-colors">
                      {favorite.asana.nameEnglish}
                    </h3>
                    <p className="text-sm text-gray-500 italic">
                      {favorite.asana.nameSanskrit}
                    </p>
                  </Link>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="px-2 py-0.5 text-xs bg-sage-100 text-sage-700 rounded-full">
                      {favorite.asana.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-gray-500">
                      {DIFFICULTY_LABELS[favorite.asana.difficulty - 1]}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCollection(favorite.asana)}
                    className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-sage-600 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
                  >
                    <FolderPlus className="w-4 h-4" />
                    Add to Collection
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Collection Modal */}
      {selectedAsana && (
        <AddToCollectionModal
          isOpen={showCollectionModal}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedAsana(null);
          }}
          asanaId={selectedAsana.id}
          asanaName={selectedAsana.nameEnglish}
        />
      )}
    </div>
  );
}

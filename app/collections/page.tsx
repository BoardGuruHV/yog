"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Folder,
  FolderPlus,
  Loader2,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  X,
} from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  asanaCount: number;
  asanas: {
    id: string;
    order: number;
    asana: {
      id: string;
      nameEnglish: string;
      svgPath: string;
    };
  }[];
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/collections");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCollections();
    }
  }, [session]);

  const fetchCollections = async () => {
    try {
      const res = await fetch("/api/collections");
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || []);
      }
    } catch (error) {
      console.error("Error fetching collections:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || creating) return;

    setCreating(true);
    try {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || null,
        }),
      });

      if (res.ok) {
        fetchCollections();
        setNewName("");
        setNewDescription("");
        setShowNewForm(false);
      }
    } catch (error) {
      console.error("Error creating collection:", error);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;

    try {
      const res = await fetch("/api/collections", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          name: editName.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (res.ok) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === id
              ? { ...c, name: editName.trim(), description: editDescription.trim() || null }
              : c
          )
        );
        setEditingId(null);
      }
    } catch (error) {
      console.error("Error updating collection:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this collection?")) return;

    try {
      const res = await fetch(`/api/collections?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setCollections((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (error) {
      console.error("Error deleting collection:", error);
    }
  };

  const startEdit = (collection: Collection) => {
    setEditingId(collection.id);
    setEditName(collection.name);
    setEditDescription(collection.description || "");
    setMenuOpen(null);
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
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Folder className="w-8 h-8" />
                My Collections
              </h1>
              <p className="text-sage-200 mt-2">
                Organize your asanas into custom collections
              </p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              <span className="hidden sm:inline">New Collection</span>
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* New Collection Form */}
        {showNewForm && (
          <div className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Create New Collection
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Morning Flow, Hip Openers"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="A brief description of this collection"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setNewName("");
                    setNewDescription("");
                  }}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newName.trim() || creating}
                  className="px-4 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Collection"}
                </button>
              </div>
            </form>
          </div>
        )}

        {collections.length === 0 && !showNewForm ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-10 h-10 text-sage-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Collections Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Create collections to organize your favorite asanas by theme,
              goal, or practice style.
            </p>
            <button
              onClick={() => setShowNewForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              Create Your First Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {editingId === collection.id ? (
                  <div className="p-4 space-y-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Description (optional)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleEdit(collection.id)}
                        className="flex-1 px-3 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Preview Images */}
                    <Link href={`/collections/${collection.id}`}>
                      <div className="aspect-[2/1] bg-gradient-to-br from-sage-50 to-white p-4 relative">
                        {collection.asanas.length > 0 ? (
                          <div className="flex items-center justify-center gap-2 h-full">
                            {collection.asanas.slice(0, 3).map((ca, idx) => (
                              <div
                                key={ca.id}
                                className="w-16 h-16 bg-white rounded-lg shadow-sm p-2"
                                style={{
                                  transform: `rotate(${(idx - 1) * 5}deg)`,
                                }}
                              >
                                <img
                                  src={ca.asana.svgPath}
                                  alt={ca.asana.nameEnglish}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                            ))}
                            {collection.asanaCount > 3 && (
                              <div className="w-16 h-16 bg-sage-100 rounded-lg flex items-center justify-center text-sage-600 font-medium">
                                +{collection.asanaCount - 3}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-300">
                            <Folder className="w-16 h-16" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <Link
                          href={`/collections/${collection.id}`}
                          className="flex-1"
                        >
                          <h3 className="font-semibold text-gray-800 hover:text-sage-600 transition-colors">
                            {collection.name}
                          </h3>
                          {collection.description && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {collection.description}
                            </p>
                          )}
                          <p className="text-sm text-gray-400 mt-2">
                            {collection.asanaCount} asana
                            {collection.asanaCount !== 1 ? "s" : ""}
                          </p>
                        </Link>

                        {/* Menu */}
                        <div className="relative">
                          <button
                            onClick={() =>
                              setMenuOpen(
                                menuOpen === collection.id ? null : collection.id
                              )
                            }
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>

                          {menuOpen === collection.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setMenuOpen(null)}
                              />
                              <div className="absolute right-0 top-8 z-20 bg-white rounded-lg shadow-lg border border-gray-100 py-1 min-w-[120px]">
                                <button
                                  onClick={() => startEdit(collection)}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    setMenuOpen(null);
                                    handleDelete(collection.id);
                                  }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      <Link
                        href={`/collections/${collection.id}`}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-sage-600 bg-sage-50 rounded-lg hover:bg-sage-100 transition-colors"
                      >
                        View Collection
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

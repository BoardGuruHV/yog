"use client";

import { useState, useEffect } from "react";
import { X, Plus, FolderPlus, Check, Loader2 } from "lucide-react";

interface Collection {
  id: string;
  name: string;
  description: string | null;
  asanaCount: number;
  asanas: { asana: { id: string } }[];
}

interface AddToCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  asanaId: string;
  asanaName: string;
}

export default function AddToCollectionModal({
  isOpen,
  onClose,
  asanaId,
  asanaName,
}: AddToCollectionModalProps) {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [addingTo, setAddingTo] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCollections();
    }
  }, [isOpen]);

  const fetchCollections = async () => {
    setLoading(true);
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

  const isInCollection = (collection: Collection) => {
    return collection.asanas.some((a) => a.asana.id === asanaId);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (addingTo) return;
    setAddingTo(collectionId);

    try {
      const res = await fetch("/api/collections/asanas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collectionId, asanaId }),
      });

      if (res.ok) {
        // Update local state
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  asanaCount: c.asanaCount + 1,
                  asanas: [...c.asanas, { asana: { id: asanaId } }],
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error adding to collection:", error);
    } finally {
      setAddingTo(null);
    }
  };

  const handleRemoveFromCollection = async (collectionId: string) => {
    if (addingTo) return;
    setAddingTo(collectionId);

    try {
      const res = await fetch(
        `/api/collections/asanas?collectionId=${collectionId}&asanaId=${asanaId}`,
        { method: "DELETE" }
      );

      if (res.ok) {
        // Update local state
        setCollections((prev) =>
          prev.map((c) =>
            c.id === collectionId
              ? {
                  ...c,
                  asanaCount: c.asanaCount - 1,
                  asanas: c.asanas.filter((a) => a.asana.id !== asanaId),
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Error removing from collection:", error);
    } finally {
      setAddingTo(null);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
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
        const data = await res.json();
        // Add asana to the new collection
        await fetch("/api/collections/asanas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            collectionId: data.collection.id,
            asanaId,
          }),
        });

        // Refresh collections
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Add to Collection
            </h2>
            <p className="text-sm text-gray-500 truncate">{asanaName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-sage-600 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* New Collection Form */}
              {showNewForm ? (
                <form
                  onSubmit={handleCreateCollection}
                  className="p-4 bg-sage-50 rounded-xl space-y-3"
                >
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Collection name"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                    autoFocus
                  />
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Description (optional)"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowNewForm(false)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newName.trim() || creating}
                      className="flex-1 px-3 py-2 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors disabled:opacity-50"
                    >
                      {creating ? "Creating..." : "Create & Add"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewForm(true)}
                  className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-200 rounded-xl hover:border-sage-300 hover:bg-sage-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-sage-100 rounded-lg flex items-center justify-center">
                    <FolderPlus className="w-5 h-5 text-sage-600" />
                  </div>
                  <span className="font-medium text-gray-700">
                    Create New Collection
                  </span>
                </button>
              )}

              {/* Existing Collections */}
              {collections.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    Your Collections
                  </p>
                  <div className="space-y-2">
                    {collections.map((collection) => {
                      const isIn = isInCollection(collection);
                      const isProcessing = addingTo === collection.id;

                      return (
                        <button
                          key={collection.id}
                          onClick={() =>
                            isIn
                              ? handleRemoveFromCollection(collection.id)
                              : handleAddToCollection(collection.id)
                          }
                          disabled={isProcessing}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                            isIn
                              ? "bg-sage-50 border border-sage-200"
                              : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                          }`}
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isIn ? "bg-sage-500 text-white" : "bg-gray-200"
                            }`}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : isIn ? (
                              <Check className="w-5 h-5" />
                            ) : (
                              <Plus className="w-5 h-5 text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-gray-800">
                              {collection.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {collection.asanaCount} asana
                              {collection.asanaCount !== 1 ? "s" : ""}
                            </p>
                          </div>
                          {isIn && (
                            <span className="text-xs text-sage-600 font-medium">
                              Added
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {collections.length === 0 && !showNewForm && (
                <p className="text-center text-gray-500 py-4">
                  Create your first collection to organize your favorite poses!
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

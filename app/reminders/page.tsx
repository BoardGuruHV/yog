"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, Plus, Loader2, BellOff } from "lucide-react";
import ReminderCard, { Reminder } from "@/components/reminders/ReminderCard";
import ReminderCreator from "@/components/reminders/ReminderCreator";

interface Program {
  id: string;
  name: string;
  totalDuration: number;
}

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreator, setShowCreator] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/reminders");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchReminders();
      fetchPrograms();
    }
  }, [session]);

  const fetchReminders = async () => {
    try {
      const res = await fetch("/api/reminders");
      if (res.ok) {
        const data = await res.json();
        setReminders(data.reminders);
      }
    } catch (error) {
      console.error("Error fetching reminders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch("/api/programs");
      if (res.ok) {
        const data = await res.json();
        setPrograms(data.programs || []);
      }
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch("/api/reminders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      });

      if (res.ok) {
        setReminders((prev) =>
          prev.map((r) => (r.id === id ? { ...r, enabled } : r))
        );
      }
    } catch (error) {
      console.error("Error toggling reminder:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      const res = await fetch(`/api/reminders?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error("Error deleting reminder:", error);
    }
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowCreator(true);
  };

  const handleSave = async (reminderData: Partial<Reminder>) => {
    try {
      if (reminderData.id) {
        // Update existing
        const res = await fetch("/api/reminders", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reminderData),
        });

        if (res.ok) {
          const data = await res.json();
          setReminders((prev) =>
            prev.map((r) =>
              r.id === data.reminder.id
                ? { ...data.reminder, programName: r.programName }
                : r
            )
          );
        }
      } else {
        // Create new
        const res = await fetch("/api/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reminderData),
        });

        if (res.ok) {
          fetchReminders(); // Refresh to get program name
        }
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
    }
  };

  const handleCloseCreator = () => {
    setShowCreator(false);
    setEditingReminder(null);
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

  const enabledReminders = reminders.filter((r) => r.enabled);
  const disabledReminders = reminders.filter((r) => !r.enabled);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-50 to-white">
      {/* Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-sage-600 to-sage-700 text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <Bell className="w-8 h-8" />
                Practice Reminders
              </h1>
              <p className="text-sage-200 mt-2">
                Set daily reminders to maintain your yoga practice
              </p>
            </div>
            <button
              onClick={() => setShowCreator(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Add Reminder</span>
            </button>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reminders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BellOff className="w-10 h-10 text-sage-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              No Reminders Yet
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Set up practice reminders to help you maintain a consistent yoga
              routine.
            </p>
            <button
              onClick={() => setShowCreator(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-sage-600 text-white rounded-lg hover:bg-sage-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Your First Reminder
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Reminders */}
            {enabledReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sage-600" />
                  Active Reminders ({enabledReminders.length})
                </h2>
                <div className="grid gap-4">
                  {enabledReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Disabled Reminders */}
            {disabledReminders.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-500 mb-4 flex items-center gap-2">
                  <BellOff className="w-5 h-5" />
                  Paused Reminders ({disabledReminders.length})
                </h2>
                <div className="grid gap-4">
                  {disabledReminders.map((reminder) => (
                    <ReminderCard
                      key={reminder.id}
                      reminder={reminder}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onEdit={handleEdit}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <h3 className="font-medium text-blue-800 mb-2">
            About Notifications
          </h3>
          <p className="text-sm text-blue-700">
            Reminders are displayed here to help you plan your practice. Browser
            push notifications require additional setup and may not be supported
            on all devices. Consider using your phone&apos;s native alarm or
            calendar app for reliable notifications.
          </p>
        </div>
      </main>

      {/* Creator Modal */}
      <ReminderCreator
        isOpen={showCreator}
        onClose={handleCloseCreator}
        onSave={handleSave}
        editingReminder={editingReminder}
        programs={programs}
      />
    </div>
  );
}

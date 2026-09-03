"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import GameCard from "@/components/GameCard";
import ProtectedContent from "@/components/ProtectedContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { authApi, GAME_STATUSES, formatStatus } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function LibraryEditor({ entry, token, onUpdated, onRemoved }) {
  const [status, setStatus] = useState(entry.status);
  const [playtimeHours, setPlaytimeHours] = useState(String(entry.playtimehours ?? 0));
  const [obtainedAchievements, setObtainedAchievements] = useState(
    String(entry.obtainedachievements ?? 0)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setSaving(true);
    setError("");

    try {
      const updated = await authApi.updateLibraryEntry(token, entry.usergameid, {
        status,
        playtime_hours: Number(playtimeHours),
        obtained_achievements: Number(obtainedAchievements),
      });
      onUpdated(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setSaving(true);
    setError("");

    try {
      await authApi.removeFromLibrary(token, entry.usergameid);
      onRemoved(entry.usergameid);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <ErrorAlert message={error} />
      <FormField
        label="Status"
        name="status"
        as="select"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
        options={GAME_STATUSES.map((value) => ({
          value,
          label: formatStatus(value),
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Playtime hours"
          name="playtimeHours"
          type="number"
          value={playtimeHours}
          onChange={(event) => setPlaytimeHours(event.target.value)}
        />
        <FormField
          label="Achievements earned"
          name="obtainedAchievements"
          type="number"
          value={obtainedAchievements}
          onChange={(event) => setObtainedAchievements(event.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        <Button variant="danger" onClick={handleRemove} disabled={saving}>
          Remove from library
        </Button>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeId, setActiveId] = useState(null);

  const loadLibrary = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await authApi.getLibrary(token);
      setEntries(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  return (
    <ProtectedContent>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <PageHeader
          title="My library"
          subtitle="Protected endpoint: only you can view and update your personal backlog."
          action={
            <Link href="/games">
              <Button variant="secondary">Add games from catalog</Button>
            </Link>
          }
        />

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingSpinner label="Loading your library..." />
        ) : entries.length === 0 ? (
          <EmptyState
            title="Your library is empty"
            message="Browse the public catalog and add games once you find something you want to track."
            actionLabel="Browse games"
            href="/games"
          />
        ) : (
          <div className="space-y-8">
            {entries.map((entry) => (
              <section key={entry.usergameid} className="space-y-4">
                <GameCard
                  game={entry}
                  variant="library"
                  status={entry.status}
                  playtimeHours={entry.playtimehours}
                  obtainedAchievements={entry.obtainedachievements}
                  footer={
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setActiveId((current) =>
                          current === entry.usergameid ? null : entry.usergameid
                        )
                      }
                    >
                      {activeId === entry.usergameid ? "Close editor" : "Edit entry"}
                    </Button>
                  }
                />
                {activeId === entry.usergameid ? (
                  <LibraryEditor
                    entry={entry}
                    token={token}
                    onUpdated={(updated) => {
                      setEntries((current) =>
                        current.map((item) =>
                          item.usergameid === updated.usergameid
                            ? { ...item, ...updated, title: item.title }
                            : item
                        )
                      );
                    }}
                    onRemoved={(userGameId) => {
                      setEntries((current) =>
                        current.filter((item) => item.usergameid !== userGameId)
                      );
                      setActiveId(null);
                    }}
                  />
                ) : null}
              </section>
            ))}
          </div>
        )}
      </main>
    </ProtectedContent>
  );
}

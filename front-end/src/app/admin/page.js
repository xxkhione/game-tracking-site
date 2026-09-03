"use client";

import { useCallback, useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import ProtectedContent from "@/components/ProtectedContent";
import LoadingSpinner from "@/components/LoadingSpinner";
import ErrorAlert from "@/components/ErrorAlert";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

function PendingGamePanel({ submission, token, onResolved }) {
  const [form, setForm] = useState({
    title: submission.title,
    genre: submission.genre,
    platform: submission.platform,
    release_year: submission.releaseyear,
    cover_url: "",
    description: "",
    achievement_count: 0,
  });
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");
  const [working, setWorking] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]:
        name === "release_year" || name === "achievement_count"
          ? Number(value)
          : value,
    }));
  }

  async function handleApprove() {
    setWorking(true);
    setError("");

    try {
      await adminApi.approvePendingGame(token, submission.pendinggameid, form);
      onResolved(submission.pendinggameid);
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  async function handleReject() {
    setWorking(true);
    setError("");

    try {
      await adminApi.rejectPendingGame(token, submission.pendinggameid, {
        rejection_reason: rejectionReason,
      });
      onResolved(submission.pendinggameid);
    } catch (err) {
      setError(err.message);
      setWorking(false);
    }
  }

  return (
    <article className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">{submission.title}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            Submitted by {submission.submitted_by_username}
          </p>
        </div>
        <StatusBadge status={submission.status} />
      </div>

      <ErrorAlert message={error} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Title" name="title" value={form.title} onChange={handleChange} />
        <FormField label="Genre" name="genre" value={form.genre} onChange={handleChange} />
        <FormField label="Platform" name="platform" value={form.platform} onChange={handleChange} />
        <FormField
          label="Release year"
          name="release_year"
          type="number"
          value={form.release_year}
          onChange={handleChange}
        />
        <FormField
          label="Cover URL"
          name="cover_url"
          value={form.cover_url}
          onChange={handleChange}
        />
        <FormField
          label="Achievement count"
          name="achievement_count"
          type="number"
          value={form.achievement_count}
          onChange={handleChange}
        />
        <div className="md:col-span-2">
          <FormField
            label="Description"
            name="description"
            as="textarea"
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </div>

      <FormField
        label="Rejection reason (optional)"
        name="rejectionReason"
        value={rejectionReason}
        onChange={(event) => setRejectionReason(event.target.value)}
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleApprove} disabled={working}>
          Approve and publish
        </Button>
        <Button variant="danger" onClick={handleReject} disabled={working}>
          Reject submission
        </Button>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const { token } = useAuth();
  const [pendingGames, setPendingGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPendingGames = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await adminApi.getPendingGames(token);
      setPendingGames(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPendingGames();
  }, [loadPendingGames]);

  return (
    <ProtectedContent requireAdmin>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <PageHeader
          title="Admin moderation"
          subtitle="Role-protected endpoint: only admin_user accounts can review pending submissions."
        />

        <ErrorAlert message={error} />

        {loading ? (
          <LoadingSpinner label="Loading pending submissions..." />
        ) : pendingGames.length === 0 ? (
          <EmptyState
            title="No pending submissions"
            message="When users submit new games, they will appear here for approval or rejection."
          />
        ) : (
          <div className="space-y-6">
            {pendingGames.map((submission) => (
              <PendingGamePanel
                key={submission.pendinggameid}
                submission={submission}
                token={token}
                onResolved={(pendingGameId) => {
                  setPendingGames((current) =>
                    current.filter((item) => item.pendinggameid !== pendingGameId)
                  );
                }}
              />
            ))}
          </div>
        )}
      </main>
    </ProtectedContent>
  );
}

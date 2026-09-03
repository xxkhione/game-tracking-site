"use client";

import Link from "next/link";
import Button from "@/components/Button";
import AddToLibraryButton from "@/components/AddToLibraryButton";
import { useAuth } from "@/context/AuthContext";

export default function TrackGameSection({ gameId }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6 text-sm text-violet-800">
        Checking your session...
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
        <h2 className="text-lg font-semibold text-violet-900">Add to your library</h2>
        <p className="mt-2 text-sm text-violet-800">
          Save this game to your personal backlog and track playtime and achievements.
        </p>
        <div className="mt-4">
          <AddToLibraryButton gameId={gameId} />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
      <h2 className="text-lg font-semibold text-violet-900">Track this game</h2>
      <p className="mt-2 text-sm text-violet-800">
        Log in or register to add this title to your personal backlog.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link href="/login">
          <Button>Log in</Button>
        </Link>
        <Link href="/register">
          <Button variant="secondary">Register</Button>
        </Link>
      </div>
    </div>
  );
}

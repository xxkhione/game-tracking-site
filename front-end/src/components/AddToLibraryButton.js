"use client";

import { useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AddToLibraryButton({ gameId }) {
  const { isAuthenticated } = useAuth()
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  if (!isAuthenticated) {
    return null
  }

  async function handleAdd() {
    setSubmitting(true)
    setError("")
    setMessage("")

    try {
      await authApi.addToLibrary({ game_id: gameId })
      setMessage("Added to your library.")
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      <ErrorAlert message={error} />
      {message ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAdd} disabled={submitting}>
          {submitting ? "Adding..." : "Add to my library"}
        </Button>
        <Link href="/library">
          <Button variant="secondary">Go to library</Button>
        </Link>
      </div>
    </div>
  )
}
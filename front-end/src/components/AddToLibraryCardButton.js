"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import { authApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function AddToLibraryCardButton({
  gameId,
  inLibrary = false,
  onAdded,
}) {
  const { isAuthenticated } = useAuth()
  const [added, setAdded] = useState(inLibrary)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    setAdded(inLibrary)
  }, [inLibrary])

  if (!isAuthenticated) {
    return null
  }

  async function handleAdd() {
    setSubmitting(true)
    setError("")

    try {
      await authApi.addToLibrary({ game_id: gameId });
      setAdded(true)
      onAdded?.(gameId)
    } catch (err) {
      if (err.status === 409) {
        setAdded(true)
        onAdded?.(gameId)
      } else {
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (added) {
    return (
      <Link href="/library" className="block">
        <Button variant="secondary" className="w-full">
          In your library
        </Button>
      </Link>
    )
  }

  return (
    <div>
      {error ? <p className="mb-2 text-xs text-red-600">{error}</p> : null}
      <Button className="w-full" onClick={handleAdd} disabled={submitting}>
        {submitting ? "Adding..." : "Add to library"}
      </Button>
    </div>
  )
}
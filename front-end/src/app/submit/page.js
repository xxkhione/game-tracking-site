"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import ProtectedContent from "@/components/ProtectedContent";
import { authApi } from "@/lib/api";

export default function SubmitGamePage() {
  const router = useRouter()
  const [form, setForm] = useState({
    title: "",
    genre: "",
    platform: "",
    release_year: new Date().getFullYear(),
  });
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: name === "release_year" ? Number(value) : value,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    setSuccess("")

    try {
      await authApi.submitPendingGame(form)
      setSuccess("Your game was submitted for admin review.")
      setForm({
        title: "",
        genre: "",
        platform: "",
        release_year: new Date().getFullYear(),
      })
      setTimeout(() => router.push("/library"), 1200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ProtectedContent>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <PageHeader
          title="Submit a game"
          subtitle="Authenticated users can suggest new catalog entries. Admins approve or reject submissions."
        />

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <ErrorAlert message={error} />
          {success ? (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          ) : null}
          <FormField
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
          <FormField
            label="Genre"
            name="genre"
            value={form.genre}
            onChange={handleChange}
            required
          />
          <FormField
            label="Platform"
            name="platform"
            value={form.platform}
            onChange={handleChange}
            required
          />
          <FormField
            label="Release year"
            name="release_year"
            type="number"
            value={form.release_year}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit for review"}
          </Button>
        </form>
      </main>
    </ProtectedContent>
  )
}
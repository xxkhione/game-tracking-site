"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import PageHeader from "@/components/PageHeader";
import FormField from "@/components/FormField";
import Button from "@/components/Button";
import ErrorAlert from "@/components/ErrorAlert";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      router.push("/library");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-lg px-4 py-10 sm:px-6">
        <PageHeader
          title="Log in"
          subtitle="Authenticated users can manage their personal game library."
        />

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <ErrorAlert message={error} />
          <FormField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
          <FormField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-violet-700 hover:underline">
            Register here
          </Link>
        </p>
      </main>
    </>
  );
}

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

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "" });
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

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      setSubmitting(false);
      return;
    }

    try {
      await register({ username: form.username, password: form.password });
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
          title="Create an account"
          subtitle="Registration unlocks your personal library and game submissions."
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
          <FormField
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-violet-700 hover:underline">
            Log in
          </Link>
        </p>
      </main>
    </>
  );
}

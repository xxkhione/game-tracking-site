"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ProtectedContent({
  children,
  requireAdmin = false,
  redirectTo = "/login",
}) {
  const router = useRouter();
  const { loading, isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(redirectTo);
      return;
    }

    if (requireAdmin && !isAdmin) {
      router.replace("/");
    }
  }, [loading, isAuthenticated, isAdmin, requireAdmin, router, redirectTo]);

  if (loading) {
    return <LoadingSpinner label="Checking your session..." />;
  }

  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return <LoadingSpinner label="Redirecting..." />;
  }

  return children;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSession } from "next-auth/react";
import GlobalLoader from "./GlobalLoaders/GlobalLoader";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading } = useAuth();
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAuthenticated = authenticated || (status === "authenticated" && session);

  useEffect(() => {
    if (status !== "loading" && !loading && !isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, loading, router, status]);

  if (loading || status === "loading" || !isAuthenticated) {
    return (
      <GlobalLoader />
    );
  }

  return <>{children}</>;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import GlobalLoader from "./GlobalLoaders/GlobalLoader";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { authenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.replace("/");
    }
  }, [authenticated, loading, router]);

  if (loading || !authenticated) {
    return (
      <GlobalLoader />
    );
  }

  return <>{children}</>;
}

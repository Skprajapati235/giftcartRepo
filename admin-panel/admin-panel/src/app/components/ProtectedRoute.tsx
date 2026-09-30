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
      if (typeof window !== "undefined") {
        window.location.replace("/?expired=true");
      } else {
        router.replace("/");
      }
    }
  }, [authenticated, loading, router]);

  // Handle bfcache (browser back/forward button restore)
  useEffect(() => {
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        const token = localStorage.getItem("giftcartAdminToken");
        const lastActive = Number(localStorage.getItem("giftcartAdminLastActive") || 0);
        if (!token || (lastActive && Date.now() - lastActive > 30000)) {
          window.location.replace("/?expired=true");
        }
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  if (loading || !authenticated) {
    return <GlobalLoader />;
  }

  return <>{children}</>;
}

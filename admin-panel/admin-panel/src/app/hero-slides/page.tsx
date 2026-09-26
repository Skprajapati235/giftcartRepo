"use client";

import HeroSlideView from "../components/hero-slides";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function HeroSlidesPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <HeroSlideView />
      </AdminMain>
    </ProtectedRoute>
  );
}

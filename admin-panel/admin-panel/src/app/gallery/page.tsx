"use client";

import GalleryView from "../components/gallery";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function GalleryPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <GalleryView />
      </AdminMain>
    </ProtectedRoute>
  );
}

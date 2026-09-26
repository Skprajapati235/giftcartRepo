"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import AddEditGallery from "../../components/gallery/addEditGallery";

export default function AddGalleryPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <AdminMain>
        <AddEditGallery
          onClose={() => router.push("/gallery")}
          onSuccess={() => router.push("/gallery")}
        />
      </AdminMain>
    </ProtectedRoute>
  );
}

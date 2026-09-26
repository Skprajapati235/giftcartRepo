"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import AddEditGallery from "../../components/gallery/addEditGallery";
import { getGalleryItemById, GalleryItem } from "../../services/galleryService";
import { Loader2 } from "lucide-react";

export default function EditGalleryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [item, setItem] = useState<GalleryItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getGalleryItemById(id)
      .then((res) => {
        if (res.success && res.data) {
          setItem(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load gallery item:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  return (
    <ProtectedRoute>
      <AdminMain>
        {loading ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="animate-spin text-primary" size={36} />
          </div>
        ) : (
          <AddEditGallery
            item={item}
            onClose={() => router.push("/gallery")}
            onSuccess={() => router.push("/gallery")}
          />
        )}
      </AdminMain>
    </ProtectedRoute>
  );
}

"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import AddEditTestimonial from "../../components/testimonials/addEditTestimonial";

export default function AddTestimonialPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <AdminMain>
        <AddEditTestimonial
          onClose={() => router.push("/testimonials")}
          onSuccess={() => router.push("/testimonials")}
        />
      </AdminMain>
    </ProtectedRoute>
  );
}

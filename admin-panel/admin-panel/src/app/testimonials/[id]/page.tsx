"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import AddEditTestimonial from "../../components/testimonials/addEditTestimonial";
import { getTestimonialById, Testimonial } from "../../services/testimonialService";
import { Loader2 } from "lucide-react";

export default function EditTestimonialPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getTestimonialById(id)
      .then((res) => {
        if (res.success && res.data) {
          setTestimonial(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load testimonial:", err);
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
          <AddEditTestimonial
            testimonial={testimonial}
            onClose={() => router.push("/testimonials")}
            onSuccess={() => router.push("/testimonials")}
          />
        )}
      </AdminMain>
    </ProtectedRoute>
  );
}

"use client";

import { useParams, useRouter } from "next/navigation";
import AdminEditForm from "@/app/components/adminProfile/adminEdit";
import ProtectedRoute from "@/app/components/ProtectedRoute";
import AdminMain from "@/app/components/AdminMain";

export default function AdminEditRoute() {
  const params = useParams();
  const router = useRouter();
  const adminId = params.id as string;

  return (
    <ProtectedRoute>
      <AdminMain>
        <div className="max-w-6xl mx-auto">
          <AdminEditForm
            adminId={adminId}
            onCancel={() => router.push(`/admins/${adminId}`)}
          />
        </div>
      </AdminMain>
    </ProtectedRoute>
  );
}

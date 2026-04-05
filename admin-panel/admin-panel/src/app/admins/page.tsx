"use client";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminsPage from "../components/adminProfile/adminProfiles";



export default function AdminsProfilePage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 p-10">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Admins</p>
            <h1 className="mt-2 text-3xl font-semibold">Admin accounts</h1>
            <p className="mt-2 text-sm text-slate-600">View, edit, or delete administrator accounts.</p>
          </div>
        </div>

        <AdminsPage />
      </main>
    </ProtectedRoute>

  )
}

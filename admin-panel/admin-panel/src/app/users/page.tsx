"use client";

import UsersView from "../components/users";
import ProtectedRoute from "../components/ProtectedRoute";

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <main className="flex-1 bg-background min-h-screen p-8">
        <div className="mb-2 items-end justify-between">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">User Management</p>
        </div>
        <UsersView />
      </main>
    </ProtectedRoute>
  );
}

"use client";

import UsersView from "../components/users";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <UsersView />
      </AdminMain>
    </ProtectedRoute>
  );
}

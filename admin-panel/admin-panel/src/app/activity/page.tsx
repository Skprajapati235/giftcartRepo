"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import ActivityView from "../components/activity/ActivityView";

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <ActivityView />
      </AdminMain>
    </ProtectedRoute>
  );
}

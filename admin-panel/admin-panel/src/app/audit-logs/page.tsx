"use client";

import AuditLogsView from "../components/auditLogs/AuditLogsView";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function AuditLogsPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <AuditLogsView />
      </AdminMain>
    </ProtectedRoute>
  );
}

"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import AdminMain from "../../components/AdminMain";
import RobotsSitemapManager from "../../components/seo/RobotsSitemapManager";

export default function RobotsSitemapRoute() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <RobotsSitemapManager />
      </AdminMain>
    </ProtectedRoute>
  );
}

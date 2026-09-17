"use client";

import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";
import DeliveryHoursSettings from "../components/deliveryHours/deliveryHoursSettings";

export default function DeliveryHoursPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <DeliveryHoursSettings />
      </AdminMain>
    </ProtectedRoute>
  );
}

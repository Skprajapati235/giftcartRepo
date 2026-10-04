"use client";

import DeliveryFleetView from "../components/deliveryFleet/DeliveryFleetView";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminMain from "../components/AdminMain";

export default function DeliveryFleetPage() {
  return (
    <ProtectedRoute>
      <AdminMain>
        <DeliveryFleetView />
      </AdminMain>
    </ProtectedRoute>
  );
}

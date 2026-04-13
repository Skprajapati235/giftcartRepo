"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "../context/AuthContext";
import { AdminProvider } from "../context/AdminContext";
import { ToastProvider } from "../../context/ToastContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId="77642027655-ika7ain9hl6ah04g5ocv4qdccoc75a7q.apps.googleusercontent.com">
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            {children}
          </AdminProvider>
        </AuthProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  );
}
"use client";

import { ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import AdminHeader from "./AdminHeader";
import { ThemeProvider } from "../context/ThemeContext";
import { SidebarProvider } from "../context/SidebarContext";
import { LiveNotificationProvider } from "../context/LiveNotificationContext";
import NotificationManager from "./NotificationManager";
import { AiChatProvider } from "../context/AiChatContext";
import { useAuth } from "../context/AuthContext";
import SessionTimeoutModal from "./auth/SessionTimeoutModal";
import GlobalLoader from "./GlobalLoaders/GlobalLoader";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = ["/", "/register", "/forgot-password"].includes(pathname || "");
  const { authenticated, loading } = useAuth();

  useEffect(() => {
    if (!hideSidebar && !loading && !authenticated) {
      if (typeof window !== "undefined") {
        window.location.replace("/?expired=true");
      }
    }
  }, [hideSidebar, loading, authenticated]);

  return (
    <ThemeProvider>
      {hideSidebar ? (
        <>{children}</>
      ) : loading ? (
        <GlobalLoader />
      ) : !authenticated ? (
        <GlobalLoader />
      ) : (
        <SidebarProvider>
          <LiveNotificationProvider>
            <AiChatProvider>
              {/* 30-Second Inactivity Warning & Countdown Modal */}
              <SessionTimeoutModal />
              <NotificationManager />
              <div className="flex h-screen overflow-hidden bg-background">
                <Sidebar aria-label="Sidebar for administration functions" />
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <AdminHeader />
                  <div className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
                    {children}
                  </div>
                </div>
              </div>
            </AiChatProvider>
          </LiveNotificationProvider>
        </SidebarProvider>
      )}
    </ThemeProvider>
  );
}

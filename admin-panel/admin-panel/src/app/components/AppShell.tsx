"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { ThemeProvider } from "../context/ThemeContext";
import { SidebarProvider } from "../context/SidebarContext";
import NotificationManager from "./NotificationManager";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = ["/", "/register"].includes(pathname || "");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <SidebarProvider>
        <NotificationManager />
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar aria-label="Sidebar for administration functions" />
          <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
            <MobileHeader />
            <div className="flex-1 overflow-x-hidden overflow-y-auto bg-background lg:border-l lg:border-border-theme">
              {children}
            </div>
          </div>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}

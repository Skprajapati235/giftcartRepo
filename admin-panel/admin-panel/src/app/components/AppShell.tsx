"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ThemeProvider } from "../context/ThemeContext";
import NotificationManager from "./NotificationManager";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = ["/", "/register"].includes(pathname || "");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <NotificationManager />
      <div className="flex h-screen overflow-hidden">
        <Sidebar aria-label="Sidebar for administration functions" />
        <main className="flex-1 overflow-y-auto bg-background relative border-l border-border-theme">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}

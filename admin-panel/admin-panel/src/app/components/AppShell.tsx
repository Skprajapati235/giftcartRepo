"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import { ThemeProvider } from "../context/ThemeContext";

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const hideSidebar = ["/", "/register"].includes(pathname || "");

  if (hideSidebar) {
    return <>{children}</>;
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </ThemeProvider>
  );
}

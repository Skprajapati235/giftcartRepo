"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useTheme } from "../context/ThemeContext";
import { Moon, Sun } from "lucide-react";

export default function MobileHeader() {
  const { openMobile } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-border-theme bg-card px-4 lg:hidden">
      <button
        type="button"
        onClick={openMobile}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition hover:bg-hover-theme"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <img
        src="/images/GiftorawithText2.png"
        alt="Giftora"
        className="h-7 max-w-[140px] object-contain"
      />

      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-theme bg-background text-foreground transition hover:bg-hover-theme"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>
    </header>
  );
}

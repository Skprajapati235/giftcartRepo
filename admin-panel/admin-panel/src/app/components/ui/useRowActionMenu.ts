import { useEffect } from "react";

/** Close row action menu when clicking outside any `[data-row-action]` wrapper */
export function useRowActionMenu(
  openMenuId: string | null,
  setOpenMenuId: (id: string | null) => void
) {
  useEffect(() => {
    if (!openMenuId) return;
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("[data-row-action]")) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [openMenuId, setOpenMenuId]);
}

export const rowActionDropdownClass =
  "absolute right-0 top-full z-[100] mt-1 w-44 rounded-2xl border border-border-theme bg-card py-2 shadow-2xl";

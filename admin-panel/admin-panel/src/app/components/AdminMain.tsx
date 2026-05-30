import type { ReactNode } from "react";

/** Consistent responsive page wrapper for admin routes */
export default function AdminMain({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main
      className={`flex-1 w-full min-w-0 max-w-full bg-background text-foreground p-4 sm:p-6 lg:p-10 ${className}`}
    >
      {children}
    </main>
  );
}

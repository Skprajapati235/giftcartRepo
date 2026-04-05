"use client";

import DeveloperInformation from "../components/developer/developerInformation";
import ProtectedRoute from "../components/ProtectedRoute";

export default function DeveloperPage() {
    return (
        <ProtectedRoute>
            <main className={`flex-1 p-10 bg-background text-foreground`}>
                <div className="mb-8 items-end justify-between">
                    <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Developer</p>
                </div>
                <DeveloperInformation />
            </main>
        </ProtectedRoute>
    );
}

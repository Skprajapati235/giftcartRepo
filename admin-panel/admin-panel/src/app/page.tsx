"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";

export default function Home() {
  const { login, authenticated, loading, error } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    try {
      await login(form);
      router.push("/dashboard");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "Unable to login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm rounded-[2.5rem] bg-card p-12 shadow-2xl transition hover:shadow-primary/5 border border-transparent dark:border-border-theme">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
             <img src="/images/Giftora.png" alt="Logo" className="h-16 w-16 rounded-[2rem] shadow-xl shadow-primary/10 border-2 border-primary/10" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Admin login</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Sign in to GiftCart</h1>
          <p className="mt-3 text-sm text-slate-500 font-medium">Access your admin dashboard</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email</label>
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              type="email"
              placeholder="admin@example.com"
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Password</label>
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {(submitError || error) && (
            <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-5 py-4 text-sm text-rose-500 font-bold">
              {submitError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {loading ? "Signing in..." : "Login to Dashboard"}
          </button>
        </form>

        <p className="mt-10 text-center text-sm text-slate-500 font-medium">
          Need an account? <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">Register</Link>
        </p>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, authenticated, loading, error } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, loading, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    if (form.password !== form.confirmPassword) {
      setSubmitError("Passwords do not match.");
      return;
    }

    try {
      await register({ name: form.name, email: form.email, password: form.password });
      router.push("/");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "Unable to register");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-md rounded-[2.5rem] bg-card p-12 shadow-2xl transition hover:shadow-primary/5 border border-transparent dark:border-border-theme">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-6">
             <img src="/images/Giftora.png" alt="Logo" className="h-16 w-16 rounded-[2rem] shadow-xl shadow-primary/10 border-2 border-primary/10" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Register as admin</h1>
          <p className="mt-2 text-sm text-slate-500 font-medium">Create your admin account to access the dashboard.</p>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
              placeholder="Your name"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email</label>
            <input
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
              placeholder="you@example.com"
              type="email"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Password</label>
            <input
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
              placeholder="Password"
              type="password"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Confirm Password</label>
            <input
              value={form.confirmPassword}
              onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
              placeholder="Confirm password"
              type="password"
              required
            />
          </div>

          {(submitError || error) && (
            <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-5 py-4 text-sm text-rose-500 font-bold leading-relaxed transition-all animate-in fade-in zoom-in-95">
              {submitError || error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 shadow-lg shadow-primary/20"
          >
            {loading ? "Registering..." : "Create Admin Account"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500 font-medium tracking-tight">
          Already have an admin account? <Link href="/" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">Login</Link>
        </p>
      </div>
    </div>
  );
}

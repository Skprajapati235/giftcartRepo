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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="w-full max-w-md rounded-3xl bg-white p-10 shadow-xl dark:bg-slate-900 dark:text-slate-100">
        <h1 className="text-2xl font-semibold text-slate-900">Register as admin</h1>
        <p className="mt-2 text-sm text-slate-600">Create your admin account to access the dashboard.</p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">Name</label>
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Your name"
          />

          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="you@example.com"
            type="email"
          />

          <label className="block text-sm font-medium text-slate-700">Password</label>
          <input
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Password"
            type="password"
          />

          <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
          <input
            value={form.confirmPassword}
            onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none"
            placeholder="Confirm password"
            type="password"
          />

          {(submitError || error) && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError || error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an admin account? <Link href="/" className="text-slate-900 font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
}

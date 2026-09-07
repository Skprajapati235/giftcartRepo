"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Mail, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register, authenticated, loading, error } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (form.password !== form.confirmPassword) {
      setSubmitError("Passwords do not match");
      return;
    }

    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/\d/.test(form.password) || !/[^A-Za-z0-9\s]/.test(form.password)) {
      setSubmitError("Password must be 8+ characters with uppercase, lowercase, digit, and special character");
      return;
    }

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      router.push("/");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "Registration failed");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden auth-bg flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/30 sm:p-6">
          <div className="text-center mb-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 shadow-xl">
              <Gift className="h-7 w-7 text-white" />
            </div>

            <h1 className="mt-4 text-2xl font-black text-foreground">Create Account</h1>
            <p className="mt-1 text-sm text-foreground/70">Sign up to manage Giftora admin tasks</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="password"
                placeholder="Confirm Password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                required
              />
            </div>

            {(submitError || error) && (
              <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-500">
                {submitError || error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white font-semibold text-sm shadow-xl hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-foreground/70">
            Already have an account?{' '}
            <Link href="/" className="font-semibold text-primary hover:text-secondary">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

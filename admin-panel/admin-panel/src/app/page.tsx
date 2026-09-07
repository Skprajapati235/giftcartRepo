"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Mail, Lock, Gift, Loader } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { isValidEmail } from "./utils/authValidation";


export default function Home() {
  const { login, setSession, authenticated, loading, error } = useAuth();

  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, loading, router]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSubmitError("");

    if (!isValidEmail(form.email.trim()) || !form.password) {
      setSubmitError("Enter a valid email and password");
      return;
    }

    try {
      await login(form);
      router.push("/dashboard");
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        "Unable to Login"
      );
    }
  };

  const handleGoogleLoginSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/auth/google-login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            idToken: credentialResponse.credential,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(
          errData.message || "Google Login Failed"
        );
      }

      const data = await res.json();

      setSession(data.token, data.user || data.admin);

      router.replace("/dashboard");
    } catch (err: any) {
      setSubmitError(
        err.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden auth-bg flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-2xl shadow-black/10 dark:shadow-black/30 sm:p-6">
          {/* Logo */}
          <div className="text-center mb-5">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 shadow-xl">
              <Gift className="h-7 w-7 text-white" />
            </div>

            <h1 className="mt-4 text-2xl font-black text-foreground">
              Giftora
            </h1>

            <p className="mt-1 text-sm text-foreground/70">
              Welcome back to your admin dashboard
            </p>

          </div>

          {/* Google Login */}
          <div className="flex justify-center mb-4">

            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() =>
                setSubmitError("Google Login Failed")
              }
            />

          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-3"
          >
            {/* Email */}

            <div className="relative">

              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value,
                  })
                }
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />

            </div>

            {/* Password */}

            <div className="relative">

              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />

              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) =>
                  setForm({
                    ...form,
                    password: e.target.value,
                  })
                }
                className="w-full h-11 rounded-xl bg-background border border-border-theme pl-11 pr-3 text-sm text-foreground placeholder:text-slate-500 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              />

            </div>

            {(submitError || error) && (
              <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-300">
                {submitError || error}
              </div>
            )}

            {/* Login Button */}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white font-semibold text-sm shadow-xl hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-60"
            >
              {loading
                ? <>
                  <div className="flex items-center justify-center gap-2">
                    <Loader color="#fff" strokeWidth={3} />
                    <div className="animate-spin"></div>
                  </div>
                </>
                : "Login"}
            </button>
          </form>
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-primary hover:text-secondary">
              Forgot password?
            </Link>
          </div>
          <div className="mt-5 text-center text-sm text-foreground/70">
            Don't have an account?
            <Link
              href="/register"
              className="ml-2 font-semibold text-primary hover:text-secondary"
            >
              Create Account
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
}
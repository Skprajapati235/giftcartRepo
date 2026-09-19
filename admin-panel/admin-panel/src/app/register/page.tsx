"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AuthBackground from "../components/auth/authBackground";
import AuthHeroSection from "../components/auth/authHeroSection";

export default function RegisterPage() {
  const { register, authenticated, loading, error } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && authenticated) {
      router.replace("/dashboard");
    }
  }, [authenticated, loading, router]);

  // Real-time password validation helpers
  const hasMinLength = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasLower = /[a-z]/.test(form.password);
  const hasNumber = /\d/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9\s]/.test(form.password);
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && hasSpecial;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitError("");

    if (!form.name.trim()) {
      setSubmitError("Please provide your full legal name.");
      return;
    }

    if (!form.email.trim()) {
      setSubmitError("Please provide a valid administrative email address.");
      return;
    }

    if (!isPasswordValid) {
      setSubmitError("Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setSubmitError("Passwords do not match. Please re-enter.");
      return;
    }

    if (!agreedToTerms) {
      setSubmitError("Please confirm agreement with the administrative access policy.");
      return;
    }

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      router.push("/");
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || err.message || "Registration failed. Please contact your system supervisor.");
    }
  };

  return (
    <div className="relative h-screen max-h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center selection:bg-pink-500/20 selection:text-pink-600 dark:selection:text-pink-400">
      {/* Dynamic Background: Rotating Rings, Dot Grid & Glows */}
      <AuthBackground />

      {/* Main Container - strictly constrained to viewport to prevent scrolling */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2 h-full flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 xl:gap-24 items-center w-full max-h-[92vh]">

          {/* Left Column: Brand Showcase */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 items-center justify-end pr-4">
            <AuthHeroSection />
          </div>

          {/* Right Column: Registration Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full flex justify-start">
            <div className="w-full max-w-[460px] bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden">

              {/* Top Gradient Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600" />

              {/* Mode Switcher Tabs: Sign In / Register */}
              <div className="flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-6 shadow-inner border border-slate-200/50 dark:border-slate-700/50">
                <Link
                  href="/"
                  className="flex-1 py-2 text-sm font-semibold rounded-lg text-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                  Sign In
                </Link>
                <button
                  type="button"
                  className="flex-1 py-2 text-sm font-bold rounded-lg shadow-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white ring-1 ring-slate-200/50 dark:ring-slate-700 transition-all"
                >
                  Register
                </button>
              </div>

              {/* Header */}
              <div className="mb-6">
                <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white mb-1.5">
                  Create Account
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                  Register for an admin account to manage the platform.
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="text-slate-400 dark:text-slate-500 w-4.5 h-4.5 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="Enter username"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="text-slate-400 dark:text-slate-500 w-4.5 h-4.5 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 transition-all font-medium shadow-sm"
                    />
                  </div>
                </div>

                {/* Password & Confirm Password side by side on desktop or compact stack */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-slate-400 dark:text-slate-500 w-4.5 h-4.5 transition-colors" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder="Enter password"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 transition-all font-medium shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="text-slate-400 dark:text-slate-500 w-4.5 h-4.5 transition-colors" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        placeholder="Confirm password"
                        value={form.confirmPassword}
                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                        className="w-full h-11 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 dark:focus:border-pink-500 focus:ring-4 focus:ring-pink-500/15 transition-all font-medium shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 transition-colors"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>



                {/* Terms checkbox */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-pink-600 focus:ring-pink-500/20 accent-pink-600 cursor-pointer shrink-0"
                    />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-tight">
                      I agree to the Terms & Conditions.
                    </span>
                  </label>
                </div>

                {/* Error Banner */}
                {(submitError || error) && (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in duration-200">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{submitError || error}</span>
                  </div>
                )}

                {/* Submit Action Button with Awesome Animated Loader */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`relative w-full h-12 mt-2 rounded-xl text-white font-bold text-sm sm:text-base shadow-lg transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden ${
                    loading
                      ? "bg-gradient-to-r from-pink-600 via-fuchsia-600 to-indigo-700 shadow-pink-500/30 cursor-wait"
                      : "bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600 hover:from-pink-600 hover:via-fuchsia-600 hover:to-indigo-700 shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  }`}
                >
                  {/* Glowing shimmer beam effect when loading */}
                  {loading && (
                    <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shimmer pointer-events-none" />
                  )}

                  {loading ? (
                    <div className="flex items-center justify-center gap-2.5 z-10">
                      <div className="relative flex h-5 w-5 items-center justify-center shrink-0">
                        <span className="absolute h-full w-full rounded-full border-2 border-white/20 border-t-white animate-spin" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      </div>
                      <span className="tracking-wide font-bold">Registering...</span>
                    </div>
                  ) : (
                    <>
                      <span>Register</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Security Note */}
              <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Secure Admin Registration</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



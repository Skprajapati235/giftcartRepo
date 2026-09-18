"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Lock, Mail, ArrowLeft, ArrowRight, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { requestAdminPasswordReset, resetAdminPassword } from "../services/adminService";
import AuthBackground from "../components/auth/authBackground";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      if (!sent) {
        await requestAdminPasswordReset(email.trim());
        setSent(true);
        setMessage("If an administrative account exists for this email, an OTP verification code has been dispatched.");
      } else {
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match");
        if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9\s]/.test(newPassword)) {
          throw new Error("Password must be 8+ characters with uppercase, lowercase, digit, and special character");
        }
        await resetAdminPassword({ email: email.trim(), otp: otp.trim(), newPassword });
        router.replace("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Unable to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex items-center justify-center px-4 py-12 overflow-x-hidden selection:bg-pink-500/20 selection:text-pink-600">
      <AuthBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-900/10 dark:shadow-black/50 relative overflow-hidden">
          
          {/* Top Gradient Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600" />

          <div className="text-center mb-6">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-pink-500 via-fuchsia-500 to-indigo-600 shadow-lg shadow-pink-500/25">
              <Gift className="h-7 w-7 text-white" />
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Reset Password
              </h1>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                Security
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
              {sent ? "Enter the 6-digit OTP sent to your registered email along with your new password." : "We'll send a one-time verification passcode to your administrative email address."}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="email"
                  required
                  placeholder="admin@giftfestive.com"
                  value={email}
                  disabled={sent}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium disabled:opacity-60"
                />
              </div>
            </div>

            {sent && (
              <div className="space-y-3.5 pt-1 animate-in fade-in duration-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Verification OTP
                  </label>
                  <input
                    inputMode="numeric"
                    maxLength={6}
                    required
                    placeholder="6-digit OTP code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 px-3.5 text-sm text-center font-mono tracking-widest text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="password"
                      required
                      placeholder="At least 8+ characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="password"
                      required
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 pl-10 pr-3.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {(error || message) && (
              <div className={`flex items-start gap-2.5 rounded-xl p-3 text-xs font-semibold ${error ? "border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400" : "border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                {error ? <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> : <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />}
                <span>{error || message}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-indigo-600 hover:from-pink-600 hover:via-fuchsia-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 group cursor-pointer"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  <span>{sent ? "Complete Password Reset" : "Send Recovery OTP"}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
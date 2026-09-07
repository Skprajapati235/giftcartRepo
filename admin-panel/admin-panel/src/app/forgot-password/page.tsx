"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Gift, Lock, Mail } from "lucide-react";
import { requestAdminPasswordReset, resetAdminPassword } from "../services/adminService";

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
        setMessage("If an account exists for this email, an OTP has been sent.");
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
    <div className="relative min-h-screen overflow-hidden auth-bg flex items-center justify-center px-4">
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card border border-border-theme rounded-2xl p-5 shadow-2xl shadow-black/10 sm:p-6">
          <div className="text-center mb-5">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-purple-600 shadow-xl"><Gift className="h-7 w-7 text-white" /></div>
            <h1 className="mt-4 text-2xl font-black text-foreground">Reset Password</h1>
            <p className="mt-1 text-sm text-foreground/70">{sent ? "Enter the OTP from your email" : "We will send a one-time password"}</p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border-theme pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div>
            {sent && <>
              <input inputMode="numeric" maxLength={6} required placeholder="6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="w-full h-11 rounded-xl bg-background border border-border-theme px-3 text-sm text-foreground outline-none focus:border-primary" />
              <div className="relative"><Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" /><input type="password" required placeholder="New strong password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border-theme pl-10 pr-3 text-sm text-foreground outline-none focus:border-primary" /></div>
              <input type="password" required placeholder="Confirm new password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full h-11 rounded-xl bg-background border border-border-theme px-3 text-sm text-foreground outline-none focus:border-primary" />
            </>}
            {(error || message) && <div className={`rounded-xl p-3 text-sm ${error ? "border border-red-400/20 bg-red-500/10 text-red-300" : "border border-emerald-400/20 bg-emerald-500/10 text-emerald-500"}`}>{error || message}</div>}
            <button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-gradient-to-r from-pink-500 via-fuchsia-500 to-violet-600 text-white font-semibold text-sm disabled:opacity-60">{loading ? "Please wait..." : sent ? "Reset Password" : "Send OTP"}</button>
          </form>
          <div className="mt-5 text-center text-sm text-foreground/70"><Link href="/" className="font-semibold text-primary hover:text-secondary">Back to login</Link></div>
        </div>
      </div>
    </div>
  );
}
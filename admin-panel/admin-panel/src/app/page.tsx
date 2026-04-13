"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./context/AuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

export default function Home() {
  const { login, setSession, authenticated, loading, error } = useAuth();
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

  const handleGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) throw new Error("No credential received");

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
        throw new Error(errData.message || "Failed to login via Google");
      }

      const data = await res.json();

      // 🔥 IMPORTANT
      setSession(data.token, data.user || data.admin);

      router.replace("/dashboard");
    } catch (err: any) {
      console.error(err);
      setSubmitError(err.message || "Something went wrong with Google Login");
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600"
          alt="Giftora"
          className="object-cover w-full h-full"
        />

        {/* Overlay Text */}
        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-white px-10">
          <h1 className="text-4xl font-extrabold mb-4">Giftora 🎁</h1>
          <p className="text-lg text-center max-w-md">
            "Delivering happiness with cakes 🎂, flowers 🌸 & beautiful surprises 💝"
          </p>
        </div>
      </div>

      {/* RIGHT SIDE LOGIN */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-pink-100 text-2xl shadow">
                🎁
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-800">
              Welcome to Giftora
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Login to manage your orders & deliveries
            </p>
          </div>

          {/* GOOGLE LOGIN */}
          <div className="w-full mb-5 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={() => setSubmitError("Google Login Failed")}
            />
          </div>

          {/* OR */}
          <div className="flex items-center my-4">
            <div className="flex-1 border-t"></div>
            <span className="px-3 text-sm text-gray-400">OR</span>
            <div className="flex-1 border-t"></div>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="email"
              placeholder="Email address"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none"
            />

            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none"
            />

            {(submitError || error) && (
              <p className="text-red-500 text-sm">
                {submitError || error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-xl font-semibold transition"
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-6">
            New here?{" "}
            <Link href="/register" className="text-pink-500 font-semibold">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
  //     <div className="w-full max-w-sm rounded-[2.5rem] bg-card p-12 shadow-2xl transition hover:shadow-primary/5 border border-transparent dark:border-border-theme">
  //       <div className="mb-10 text-center">
  //         <div className="flex justify-center mb-6">
  //            <img src="/images/Giftora.png" alt="Logo" className="h-16 w-16 rounded-[2rem] shadow-xl shadow-primary/10 border-2 border-primary/10" />
  //         </div>
  //         <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-bold">Admin login</p>
  //         <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground">Sign in to GiftCart</h1>
  //         <p className="mt-3 text-sm text-slate-500 font-medium">Access your admin dashboard</p>
  //       </div>

  //       <div className="space-y-4">
  //         <button
  //           onClick={handleGoogleSignIn}
  //           className="w-full rounded-2xl bg-white border border-gray-300 px-5 py-4 text-sm font-bold text-gray-700 transition hover:bg-gray-50 shadow-lg flex items-center justify-center"
  //         >
  //           <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
  //             <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
  //             <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
  //             <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
  //             <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  //           </svg>
  //           Sign in with Google
  //         </button>

  //         <div className="relative">
  //           <div className="absolute inset-0 flex items-center">
  //             <span className="w-full border-t border-gray-300" />
  //           </div>
  //           <div className="relative flex justify-center text-sm">
  //             <span className="px-2 bg-card text-slate-500">Or continue with</span>
  //           </div>
  //         </div>

  //         <form className="space-y-6" onSubmit={handleSubmit}>
  //           <div className="space-y-2">
  //             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email</label>
  //             <input
  //               value={form.email}
  //               onChange={(event) => setForm({ ...form, email: event.target.value })}
  //               type="email"
  //               placeholder="admin@example.com"
  //               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
  //             />
  //           </div>

  //           <div className="space-y-2">
  //             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Password</label>
  //             <input
  //               value={form.password}
  //               onChange={(event) => setForm({ ...form, password: event.target.value })}
  //               type="password"
  //               placeholder="••••••••"
  //               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
  //             />
  //           </div>

  //           {(submitError || error) && (
  //             <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-5 py-4 text-sm text-rose-500 font-bold">
  //               {submitError || error}
  //             </p>
  //           )}

  //           <button
  //             type="submit"
  //             disabled={loading}
  //             className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 shadow-lg shadow-primary/20"
  //           >
  //             {loading ? "Signing in..." : "Login to Dashboard"}
  //           </button>
  //         </form>
  //       </div>

  //       <p className="mt-10 text-center text-sm text-slate-500 font-medium">
  //         Need an account? <Link href="/register" className="font-bold text-primary hover:underline underline-offset-4">Register</Link>
  //       </p>
  //     </div>
  //   </div>
  // );
}

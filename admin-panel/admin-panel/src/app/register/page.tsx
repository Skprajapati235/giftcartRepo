// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useAuth } from "../context/AuthContext";

// export default function RegisterPage() {
//   const { register, authenticated, loading, error } = useAuth();
//   const router = useRouter();
//   const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
//   const [submitError, setSubmitError] = useState("");

//   useEffect(() => {
//     if (!loading && authenticated) {
//       router.replace("/dashboard");
//     }
//   }, [authenticated, loading, router]);

//   const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setSubmitError("");

//     if (form.password !== form.confirmPassword) {
//       setSubmitError("Passwords do not match.");
//       return;
//     }

//     try {
//       await register({ name: form.name, email: form.email, password: form.password });
//       router.push("/");
//     } catch (err: any) {
//       setSubmitError(err.response?.data?.message || err.message || "Unable to register");
//     }
//   };

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background p-6 text-foreground">
//       <div className="w-full max-w-md rounded-[2.5rem] bg-card p-12 shadow-2xl transition hover:shadow-primary/5 border border-transparent dark:border-border-theme">
//         <div className="mb-10 text-center">
//           <div className="flex justify-center mb-6">
//              <img src="/images/Giftora.png" alt="Logo" className="h-16 w-16 rounded-[2rem] shadow-xl shadow-primary/10 border-2 border-primary/10" />
//           </div>
//           <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Register as admin</h1>
//           <p className="mt-2 text-sm text-slate-500 font-medium">Create your admin account to access the dashboard.</p>
//         </div>

//         <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
//           <div className="space-y-1.5">
//             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Name</label>
//             <input
//               value={form.name}
//               onChange={(event) => setForm({ ...form, name: event.target.value })}
//               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
//               placeholder="Your name"
//               required
//             />
//           </div>

//           <div className="space-y-1.5">
//             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Email</label>
//             <input
//               value={form.email}
//               onChange={(event) => setForm({ ...form, email: event.target.value })}
//               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
//               placeholder="you@example.com"
//               type="email"
//               required
//             />
//           </div>

//           <div className="space-y-1.5">
//             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Password</label>
//             <input
//               value={form.password}
//               onChange={(event) => setForm({ ...form, password: event.target.value })}
//               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
//               placeholder="Password"
//               type="password"
//               required
//             />
//           </div>

//           <div className="space-y-1.5">
//             <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 px-1">Confirm Password</label>
//             <input
//               value={form.confirmPassword}
//               onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
//               className="w-full rounded-2xl border border-border-theme bg-hover-theme px-5 py-4 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-primary/20"
//               placeholder="Confirm password"
//               type="password"
//               required
//             />
//           </div>

//           {(submitError || error) && (
//             <p className="rounded-2xl bg-rose-500/10 border border-rose-500/20 px-5 py-4 text-sm text-rose-500 font-bold leading-relaxed transition-all animate-in fade-in zoom-in-95">
//               {submitError || error}
//             </p>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60 shadow-lg shadow-primary/20"
//           >
//             {loading ? "Registering..." : "Create Admin Account"}
//           </button>
//         </form>

//         <p className="mt-8 text-center text-sm text-slate-500 font-medium tracking-tight">
//           Already have an admin account? <Link href="/" className="font-bold text-primary hover:underline underline-offset-4 decoration-2">Login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      router.push("/");
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || err.message || "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* LEFT SIDE IMAGE */}
      <div className="hidden md:flex w-1/2 relative">
        <img
          src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=1600"
          alt="Giftora"
          className="object-cover w-full h-full"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white px-10">
          <h1 className="text-4xl font-extrabold mb-4">Giftora 🎁</h1>
          <p className="text-lg text-center max-w-md">
            "Spread love with cakes 🎂, flowers 🌸 & beautiful surprises 💝"
          </p>
        </div>
      </div>

      {/* RIGHT SIDE FORM */}
      <div className="flex w-full md:w-1/2 items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl">

          {/* HEADER */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 flex items-center justify-center rounded-full bg-pink-100 text-2xl shadow">
                🎁
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-gray-800">
              Create Account
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              Start managing Giftora deliveries 🚚
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-5">

            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-pink-300 outline-none"
            />

            <input
              type="email"
              placeholder="Email Address"
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

            <input
              type="password"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/" className="text-pink-500 font-semibold">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
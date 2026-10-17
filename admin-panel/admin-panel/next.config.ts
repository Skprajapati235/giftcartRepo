import type { NextConfig } from "next";

// ── Cookie sessions (set NEXT_PUBLIC_COOKIE_AUTH=true to switch on) ─────────
// The browser calls /backend/* on THIS domain and Next/Vercel forwards it to the
// real API, so the admin login cookie is first-party and JavaScript never sees the token.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://giftcartrepo.onrender.com/api").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [{ source: "/backend/:path*", destination: `${API_URL}/:path*` }];
  },
};

export default nextConfig;

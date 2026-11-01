import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tailscale MagicDNS: Cloudflare in front of Supabase Auth 403s a bare-IP redirect_to
  allowedDevOrigins: ["guria.tail8c69fb.ts.net"],
};

export default nextConfig;

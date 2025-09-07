// next.config.ts

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ This is what disables ESLint during Vercel builds
  },
};

export default nextConfig;


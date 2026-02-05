// NOTE: next-pwa is temporarily disabled due to Next.js 15 compatibility issues
// Consider migrating to @serwist/next or next-pwa-pack for Next.js 15+ support
// import withPWAInit from "next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle tensorflow webgpu backend (optional dependency)
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@tensorflow/tfjs-backend-webgpu": false,
    };

    return config;
  },
};

export default nextConfig;

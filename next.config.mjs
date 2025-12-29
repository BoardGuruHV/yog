import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      // Cache SVG asana images
      urlPattern: /^https?:\/\/.*\/asanas\/.*\.svg$/,
      handler: "CacheFirst",
      options: {
        cacheName: "asana-images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache API responses for asanas
      urlPattern: /^https?:\/\/.*\/api\/asanas.*$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "asana-api",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      // Cache API responses for programs
      urlPattern: /^https?:\/\/.*\/api\/programs.*$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "programs-api",
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24, // 24 hours
        },
      },
    },
    {
      // Cache API responses for templates
      urlPattern: /^https?:\/\/.*\/api\/templates.*$/,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "templates-api",
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        },
      },
    },
    {
      // Cache static assets
      urlPattern: /\.(?:js|css|woff|woff2|ttf|otf|ico)$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "static-assets",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache images
      urlPattern: /\.(?:png|jpg|jpeg|gif|webp|svg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "images",
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache audio files for meditation
      urlPattern: /\.(?:mp3|wav|ogg)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "audio",
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        },
      },
    },
    {
      // Cache Google Fonts
      urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
      handler: "CacheFirst",
      options: {
        cacheName: "google-fonts",
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
        },
      },
    },
  ],
});

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

export default withPWA(nextConfig);

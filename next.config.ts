import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/seminar',
        destination: '/rh-healthcare-ntai-conference-ric-jaipur-2026',
        permanent: true, // 308 — tells Google to update its index
      },
    ]
  },
  images: {
    unoptimized: true,
    domains: ["rh-healthcare.s3.ap-south-1.amazonaws.com", "d2c3lsl35lix55.cloudfront.net", "media.rhhealthcaresimulation.com"],
  },
  async headers() {
    return [
      {
        // Routes this applies to
        source: "/api/(.*)",
        // Headers
        headers: [
          // Allow for specific domains to have access or * for all
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
            // DOES NOT WORK
            // value: process.env.ALLOWED_ORIGIN,
          },
          // Allows for specific methods accepted
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
          // Allows for specific headers accepted (These are a few standard ones)
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
        ],
      },
    ];
  },
  /* config options here */
};

export default nextConfig;

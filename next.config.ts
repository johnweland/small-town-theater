import type { NextConfig } from "next";
import outputs from "./amplify_outputs.json";

const storageHostname = outputs.storage
  ? `${outputs.storage.bucket_name}.s3.${outputs.storage.aws_region}.amazonaws.com`
  : null;

const nextConfig: NextConfig = {
  allowedDevOrigins: ["10.1.1.35"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "**.fbcdn.net",
        pathname: "/**",
      },
      ...(storageHostname
        ? [
            {
              protocol: "https" as const,
              hostname: storageHostname,
              pathname: "/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

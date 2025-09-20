import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/financials",
        destination: "/financials/records",
        permanent: true, // change to false if temporary
      },
      {
        source: "/assets-inventory",
        destination: "/assets-inventory/inventory",
        permanent: true, // change to false if temporary
      },
      {
        source: "/contacts",
        destination: "/contacts/customers",
        permanent: true, // change to false if temporary
      },
    ];
  },
};

export default nextConfig;

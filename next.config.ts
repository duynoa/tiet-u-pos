import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // images: {
  //   remotePatterns: [
  //     {
  //       protocol: 'http',
  //       hostname: '192.168.1.26',
  //     },
  //     {
  //       protocol: 'https',
  //       hostname: 'tietu.fmrp.vn',
  //     },
  //   ],
  // },
  images: {
    dangerouslyAllowLocalIP: true, 

    remotePatterns: [
      {
        protocol: 'http',
        hostname: '192.168.1.26',
      },
      {
        protocol: 'https',
        hostname: 'tietu.fmrp.vn',
      },
      {
        protocol: 'https',
        hostname: 'payment.pay2s.vn',
      },
    ],
  },

  allowedDevOrigins: [
    "192.168.1.*",
  ],
};

export default nextConfig;

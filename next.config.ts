/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "alehkgbhancktvfaspnl.supabase.co",
        pathname: "/storage/v1/object/public/gianconstruction/**",
      },
      
    ],
  },
};

export default nextConfig;

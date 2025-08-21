/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', 'http://localhost:3000'],
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/shared'],
  reactStrictMode: true,
};

module.exports = nextConfig;

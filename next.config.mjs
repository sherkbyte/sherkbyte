/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/sherkbyte',
  assetPrefix: '/sherkbyte/',
  reactStrictMode: true,
  transpilePackages: ['three']
};
export default nextConfig;

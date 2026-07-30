import { fileURLToPath } from 'url';
import path from 'path';

const frontendRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: frontendRoot,
  async rewrites() {
    return [{ source: '/server/medguard-api/:path*', destination: `${process.env.EXPRESS_API_URL || 'http://localhost:3001/api'}/:path*` }];
  }
};

export default nextConfig;

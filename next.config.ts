import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH  ?? '';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,

  async rewrites() {
    if (isDev) {
      return [
        {
          source: '/api/:path*',
          destination: `${process.env.NEXT_PUBLIC_BROKERAGE_SERVICE_API}/api/:path*`
        }
      ];
    }

    return [];
  }
};

export default nextConfig;

import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV === 'development';
const isStaticExport = process.env.STATIC_EXPORT === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const nextConfig: NextConfig = {
  reactCompiler: true,
  output: isStaticExport ? 'export' : 'standalone',
  basePath: isStaticExport ? basePath : '',
  assetPrefix: isStaticExport ? basePath : '',
  ...(isDev && !isStaticExport
    ? {
        async rewrites() {
          return [
            {
              source: '/api/:path*',
              destination: `${process.env.NEXT_PUBLIC_BROKERAGE_SERVICE_API}/api/:path*`
            }
          ];
        }
      }
    : {})
};

export default nextConfig;

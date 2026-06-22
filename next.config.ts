import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'https://submit-data.bodc.ac.uk/api/:path*'
        }
      ];
    }

    return [];
  }
};

export default nextConfig;

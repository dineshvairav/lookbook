
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Critical for GitHub Pages static export
  images: {
    unoptimized: true, // Required for static export with next/image
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Added for Google profile pictures
        port: '',
        pathname: '/**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true, 
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  assetPrefix: '', // Keep empty, actions/configure-pages can handle if needed or adjust if deploying to subpath
  basePath: '',    // Keep empty, actions/configure-pages can handle if needed or adjust if deploying to subpath
};

export default nextConfig;

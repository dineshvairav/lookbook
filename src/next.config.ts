
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  // output: 'export', // Critical for GitHub Pages static export - REMOVED for Server Action support
  images: {
    unoptimized: true, // Disables Vercel's image optimization to avoid free-tier usage limits.
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
  assetPrefix: '', 
  basePath: '',    
};

export default nextConfig;

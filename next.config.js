/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here...
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**', // Allow any path under this hostname
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add this rule to handle the 'canvas' module issue with Konva
    // Konva tries to require 'canvas' conditionally, which can cause build issues in Next.js
    if (!isServer) {
      // Prevent bundling 'canvas' on the client side by marking it as external
      // This assumes the browser's native Canvas API will be used.
      config.externals.push('canvas');
    }
    return config;
  },
  // Any other Next.js config options go here
};

export default nextConfig;

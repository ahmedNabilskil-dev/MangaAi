/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here...

  webpack: (config, { isServer }) => {
    // Alias 'konva' to the browser version on the client-side
    // This helps prevent Node-specific modules like 'canvas' from being bundled
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Adjust the path if necessary based on konva's package structure
        // Common paths are 'konva/lib/index-browser' or sometimes just 'konva/konva'
        'konva': 'konva/lib/index-browser',
      };
    }

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here...

  webpack: (config, { isServer }) => {
    // Prevent 'canvas' module from being bundled on the client
    // where Konva might unnecessarily try to import it sometimes
    // even if using the browser build.
    // Also ensure 'konva' specifically resolves to the browser version.
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force 'canvas' resolution to false for client bundles
      // This prevents the error "Module not found: Can't resolve 'canvas'"
      canvas: false,
      // Ensure konva resolves to the browser version, might be redundant
      // if the dynamic import is working correctly, but kept for robustness.
      'konva$': 'konva/lib/index-browser',
    };

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

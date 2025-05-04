/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here...

  webpack: (config, { isServer }) => {
    // No longer need Konva specific aliases
    // config.resolve.alias = {
    //   ...config.resolve.alias,
    //   canvas: false,
    //   'konva$': 'konva/lib/index-browser',
    // };

    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

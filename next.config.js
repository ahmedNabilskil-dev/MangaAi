/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your existing Next.js config options here...
  images: {
    domains: ["images.unsplash.com", "res.cloudinary.com", "cdn.example.com"],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.externals.push({
        handlebars: "commonjs handlebars",
      });
    }
    // Important: return the modified config
    return config;
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  // These two packages ship browser-focused ESM that is used in client-only
  // features. Ant Design and its rc-* dependencies are already consumable by
  // Next.js and do not need to be rebuilt in their entirety during development.
  transpilePackages: ["react-pdf", "hibp"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tutorhub.api.nisirtech.com",
      },
    ],
  },
  webpack: (config) => {
    // PDF.js can optionally use node-canvas on the server. The application only
    // uses its browser viewer, so keep that native dependency out of the bundle.
    config.resolve.alias.canvas = false;
    return config;
  },
};


export default nextConfig;

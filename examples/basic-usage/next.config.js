const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
  transpilePackages: [
    "@contextualai/oryx-react",
    "@contextualai/oryx-proxy-node",
  ],
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  outputFileTracingRoot: __dirname,
  transpilePackages: [
    "@contextualai/oryx-react",
    "@contextualai/oryx-proxy-node",
  ],
};

module.exports = nextConfig;

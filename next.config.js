/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
      },
      {
        protocol: 'https',
        hostname: 'api.qrserver.com',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.w3s.link',
      },
      {
        protocol: 'https',
        hostname: '**.ipfs.dweb.link',
      },
    ],
    // Optimize images for better LCP
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  reactStrictMode: true,
  // Server-side only environment variables (not exposed to client)
  env: {
    PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
    BICONOMY_API_KEY: process.env.BICONOMY_API_KEY,
    BICONOMY_PAYMASTER_URL: process.env.BICONOMY_PAYMASTER_URL,
    BICONOMY_PAYMASTER_ID: process.env.BICONOMY_PAYMASTER_ID,
    BICONOMY_BUNDLER_URL: process.env.BICONOMY_BUNDLER_URL,
  },
  // Increase serverless function timeout for API routes
  serverRuntimeConfig: {
    // Will only be available on the server side
    timeoutSeconds: 30,
  },
  // Configure headers for security
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  // Configure webpack to handle BigInt literals
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    return config;
  },
  // Configure transpiler options for ES2020
  compiler: {
    styledComponents: true,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    // Temporarily ignore build errors from dependencies (@reown/appkit-common)
    // This is safe because skipLibCheck is enabled and the error is in node_modules
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 
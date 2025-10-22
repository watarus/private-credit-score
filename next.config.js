const path = require("path");
const webpack = require("webpack");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    esmExternals: 'loose',
  },
  webpack: (config, { isServer }) => {
    // Exclude @zama-fhe/relayer-sdk and related packages from server-side rendering
    if (isServer) {
      config.externals.push({
        '@zama-fhe/relayer-sdk': 'commonjs @zama-fhe/relayer-sdk',
        '@zama-fhe/relayer-sdk/web': 'commonjs @zama-fhe/relayer-sdk/web',
        'tfhe': 'commonjs tfhe',
        'tkms': 'commonjs tkms',
      });
    } else {
      // For client-side, provide polyfills for Node.js globals
      config.resolve.fallback = {
        ...config.resolve.fallback,
        global: false,
        process: false,
        buffer: false,
      };
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      path: false,
      child_process: false,
    };

    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "tfhe_bg.wasm": path.resolve(__dirname, "public/fhevm/tfhe_bg.wasm"),
    };

    config.experiments = {
      ...(config.experiments || {}),
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
      generator: {
        filename: "static/chunks/[name].[hash][ext]",
      },
    });

    // Add ProvidePlugin to provide global for browser environment
    config.plugins.push(
      new webpack.ProvidePlugin({
        global: 'global/window',
      })
    );

    return config;
  },
};

module.exports = nextConfig;

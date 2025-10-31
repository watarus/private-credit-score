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
  // Disable minification for easier debugging
  swcMinify: false,
  compiler: {
    removeConsole: false,
  },
  webpack: (config, { isServer }) => {
    // Disable minification for debugging
    config.optimization.minimize = false;

    // Exclude @zama-fhe/relayer-sdk and related packages from server-side rendering
    if (isServer) {
      // More aggressive external configuration
      config.externals = [
        ...config.externals,
        /@zama-fhe\/.*/,
        /tfhe/,
        /tkms/,
      ];
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
        global: path.resolve(__dirname, "polyfills/global.js"),
      })
    );

    return config;
  },
};

module.exports = nextConfig;
// Force rebuild 2025年 11月 1日 土曜日 04時01分41秒 JST

import type { NextConfig } from "next";
import type { Configuration } from "webpack";

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false, 
      "konva/lib/index-node.js": "konva/lib/index.js",
    };
    return config;
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Exclude PDFKit font files from webpack bundling
      // PDFKit will use built-in fonts instead
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };

      // Ignore PDFKit's font files
      config.externals = config.externals || [];
      config.externals.push({
        'pdfkit': 'commonjs pdfkit',
      });
    }
    return config;
  },
};

export default nextConfig;

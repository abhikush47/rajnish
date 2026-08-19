const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin('./src/i18n.js');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com', 'via.placeholder.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    outputFileTracingIncludes: {
      '/api/**/*': ['./data/**/*'],
    },
  },
};

module.exports = withNextIntl(nextConfig);

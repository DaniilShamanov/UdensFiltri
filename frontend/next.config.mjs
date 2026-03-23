import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: false,
  output: 'standalone',

  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.stripe.com',
      },
    ],
  },

  async headers() {
    return [
      {
        source: '/(.*)',
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
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.stripe.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https:;
              connect-src 'self' https://*.stripe.com https://*.sendgrid.net;
              font-src 'self';
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              block-all-mixed-content;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
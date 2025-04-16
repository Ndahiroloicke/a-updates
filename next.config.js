/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // ⚠️ Disables all TypeScript errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ⚠️ Disables ESLint checks
  },
  images: {
    domains: [
      'utfs.io',
      'example.com',
      'your-other-domain.com',
      'j1384sfojb.ufs.sh'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: '*.ufs.sh',
        port: '',
        pathname: '/a/**',
      },
    ],
  },
}

module.exports = nextConfig 
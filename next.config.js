// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'youtu.be', pathname: '/**' },
      { protocol: 'https', hostname: 'www.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'youtube.com', pathname: '/**' },
    ],
  },

  async redirects() {
    return [
      // Redirect main domain’s /dashboard → app subdomain
      {
        source: '/dashboard',
        has: [
          {
            type: 'host',
            value: 'smsram.dedyn.io',
          },
        ],
        destination: 'https://app.smsram.dedyn.io',
        permanent: false,
      },
    ]
  },

  async rewrites() {
    return [
      // When visiting app.smsram.dedyn.io, show /dashboard page content
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'app.smsram.dedyn.io',
          },
        ],
        destination: '/dashboard', // internally render /dashboard
      },
      // Make sure all subpaths also work (like /settings, /profile, etc.)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'app.smsram.dedyn.io',
          },
        ],
        destination: '/dashboard/:path*',
      },
    ]
  },
}

module.exports = nextConfig

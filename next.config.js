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
      // 👇 Redirect /dashboard on main domain → app subdomain (same content)
      {
        source: '/dashboard',
        has: [
          {
            type: 'host',
            value: 'smsram.dedyn.io',
          },
        ],
        destination: 'https://app.smsram.dedyn.io',
        permanent: false, // use true if you want a permanent 308 redirect
      },
    ]
  },

  async rewrites() {
    return [
      // 👇 app subdomain should render /dashboard internally
      {
        source: '/',
        has: [
          {
            type: 'host',
            value: 'app.smsram.dedyn.io',
          },
        ],
        destination: '/dashboard',
      },
    ]
  },
}

module.exports = nextConfig

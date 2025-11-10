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

  async rewrites() {
    return [
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

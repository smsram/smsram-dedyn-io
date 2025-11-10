// next.config.js
const nextConfig = {
  images: {
    remotePatterns: [
      // YouTube static thumbnails
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/vi/**' },
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/vi/**' },
      // If you ever proxy or build thumbs differently, keep these too:
      { protocol: 'https', hostname: 'i.ytimg.com', pathname: '/**' },
      { protocol: 'https', hostname: 'img.youtube.com', pathname: '/**' },
      // Optional: allow youtu.be if you end up resolving images via that host
      { protocol: 'https', hostname: 'youtu.be', pathname: '/**' },
      // Optional: full youtube domain if needed
      { protocol: 'https', hostname: 'www.youtube.com', pathname: '/**' },
      { protocol: 'https', hostname: 'youtube.com', pathname: '/**' },
    ],
  },
}

module.exports = nextConfig

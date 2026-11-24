/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
  // The PPU1 template is read from disk at runtime by these routes.
  outputFileTracingIncludes: {
    '/api/claim/[code]/refund-request': ['./lib/forms/**'],
    '/api/admin/claims/[id]/ppu1': ['./lib/forms/**'],
  },
};

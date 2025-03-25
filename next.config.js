/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      }
    ],
    unoptimized: true, // Untuk menangani GIF animasi
  },
  output: 'standalone',
}

module.exports = nextConfig 
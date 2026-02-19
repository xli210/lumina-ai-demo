/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Include private download files in Vercel deployment
  outputFileTracingIncludes: {
    "/api/downloads/\\[filename\\]": ["./downloads-private/**/*"],
  },
}

export default nextConfig

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: Permite build mesmo com warnings do ESLint
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: Permite build mesmo com erros de TypeScript durante builds
    ignoreBuildErrors: false,
  },
}

module.exports = nextConfig

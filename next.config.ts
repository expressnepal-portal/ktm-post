/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "news.nepalvoices.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "cms.bodhiberry.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cms.bodhiberry.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.onlinekhabar.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets-cdn-api.ekantipur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets-cdn.ekantipur.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;

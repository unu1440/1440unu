/** @type {import('next').NextConfig} */
const nextConfig = {
  // 블로그 시절 주소로 들어오면 포트폴리오 홈으로 보냄
  async redirects() {
    return [
      { source: "/about", destination: "/", permanent: false },
      // 영어가 메인(/)이 되면서 없어진 주소
      { source: "/en", destination: "/", permanent: false },
      { source: "/category/:path*", destination: "/", permanent: false },
      { source: "/posts/:path*", destination: "/", permanent: false },
    ];
  },
};

module.exports = nextConfig;

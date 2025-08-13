import type { NextConfig } from "next";
import createNextPWA from "next-pwa";

const withPWA = createNextPWA({
  dest: "public", // 생성될 sw/assets 위치
  disable: process.env.NODE_ENV === "development",
  register: true, // 클라이언트에서 자동 등록
  skipWaiting: true, // 새 SW가 오면 즉시 활성화
  manifest: "/manifest.json",
  // 필요 시 런타임 캐싱 규칙 추가
  // runtimeCaching: [
  //   {
  //     urlPattern: /^https:\/\/api\.example\.com\//,
  //     handler: 'NetworkFirst',
  //     options: { cacheName: 'api-cache', networkTimeoutSeconds: 5 },
  //   },
  // ],
});

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: [
      "spxfppfdlitjgrxinxvz.supabase.co", // 본인의 Supabase 프로젝트 도메인
      "jb-kosme-start.vercel.app",
    ],
    unoptimized: false, // 이미지 최적화 다시 활성화
  },
  // 정적 파일 서빙을 위한 설정
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;

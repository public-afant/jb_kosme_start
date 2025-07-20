import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
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

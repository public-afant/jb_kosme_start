import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "spxfppfdlitjgrxinxvz.supabase.co", // 본인의 Supabase 프로젝트 도메인
    ],
    unoptimized: true, // 이미지 최적화 비활성화 (배포 환경에서 문제 해결)
  },
};

export default nextConfig;

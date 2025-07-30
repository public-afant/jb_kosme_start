"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type Banner = {
  id: string;
  title: string;
  image_url: string;
  link_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  order_index: number;
};

export default function BannerPopup() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);

  // 오늘 하루 보지 않기 체크
  const checkTodayDismissed = () => {
    if (typeof window === "undefined") return false;

    const dismissedDate = localStorage.getItem("banner_dismissed_date");
    if (!dismissedDate) return false;

    const today = new Date().toDateString();
    return dismissedDate === today;
  };

  // 오늘 하루 보지 않기 설정
  const dismissForToday = () => {
    if (typeof window === "undefined") return;

    const today = new Date().toDateString();
    localStorage.setItem("banner_dismissed_date", today);
    setIsVisible(false);
  };

  // 배너 데이터 불러오기
  const fetchBanners = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .lte("start_date", today) // 시작일이 오늘 이전이거나 같음
        .gte("end_date", today) // 종료일이 오늘 이후이거나 같음
        .order("order_index", { ascending: true });

      if (error) {
        console.error("배너 로딩 실패:", error);
        return;
      }

      console.log("불러온 배너:", data); // 디버깅용
      setBanners(data || []);
    } catch (error) {
      console.error("배너 로딩 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  // 다음 배너로 이동
  const nextBanner = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }
  };

  // 이전 배너로 이동
  const prevBanner = () => {
    if (banners.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  // 팝업 닫기
  const closePopup = () => {
    setIsVisible(false);
  };

  useEffect(() => {
    fetchBanners();

    // 오늘 하루 보지 않기 체크
    if (checkTodayDismissed()) {
      setIsVisible(false);
    }
  }, []);

  if (loading) {
    return null;
  }

  if (banners.length === 0) {
    console.log("표시할 배너가 없습니다."); // 디버깅용
    return null;
  }

  if (!isVisible) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative mx-4">
        {/* 팝업 배너 컨테이너 */}
        <div
          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl"
          style={{ width: "400px", height: "600px" }}
        >
          {/* 배너 이미지 */}
          <div className="relative w-full h-full">
            {currentBanner.link_url ? (
              <Link
                href={currentBanner.link_url}
                className="block w-full h-full"
              >
                <Image
                  src={currentBanner.image_url}
                  alt={currentBanner.title}
                  width={400}
                  height={600}
                  className="w-full h-full object-cover"
                  priority
                />
              </Link>
            ) : (
              <Image
                src={currentBanner.image_url}
                alt={currentBanner.title}
                width={400}
                height={600}
                className="w-full h-full object-cover"
                priority
              />
            )}
          </div>

          {/* 오늘 하루 보지 않기 버튼 */}
          <button
            onClick={dismissForToday}
            className="absolute top-3 right-17 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
          >
            오늘 하루 보지 않기
          </button>

          {/* 닫기 버튼 */}
          <button
            onClick={closePopup}
            className="absolute top-3 right-3 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition-colors"
          >
            닫기
          </button>

          {/* 배너 개수 표시 */}
          {banners.length > 1 && (
            <div className="absolute top-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
              {currentIndex + 1} / {banners.length}
            </div>
          )}

          {/* 네비게이션 버튼들 */}
          {banners.length > 1 && (
            <>
              {/* 이전 버튼 */}
              <button
                onClick={prevBanner}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="이전 배너"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              {/* 다음 버튼 */}
              <button
                onClick={nextBanner}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-colors"
                aria-label="다음 배너"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* 인디케이터 */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex gap-2">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-white"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  aria-label={`배너 ${index + 1}로 이동`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 배경 클릭으로 닫기 */}
        <div className="absolute inset-0 -z-10" onClick={closePopup} />
      </div>
    </div>
  );
}

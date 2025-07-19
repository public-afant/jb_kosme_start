"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const supabase = createClient();
const ITEMS_PER_PAGE = 10; // 페이지당 10개씩

type Notice = {
  id: string;
  title: string;
  content: string;
  views: number;
  created_at: string;
  updated_at: string;
  fk_user_id: string;
  state: boolean;
};

export default function NoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [allNotices, setAllNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchNotices();
  }, []);

  useEffect(() => {
    // 검색어에 따라 필터링
    if (!searchTerm.trim()) {
      setAllNotices(allNotices);
      setCurrentPage(1);
    } else {
      const term = searchTerm.toLowerCase().trim();
      const filtered = allNotices.filter(
        (notice) =>
          notice.title.toLowerCase().includes(term) ||
          notice.content.toLowerCase().includes(term)
      );
      setAllNotices(filtered);
      setCurrentPage(1);
    }
  }, [searchTerm, allNotices]);

  useEffect(() => {
    // 페이지네이션 계산
    const total = allNotices.length;
    const pages = Math.ceil(total / ITEMS_PER_PAGE);
    setTotalPages(pages);

    // 현재 페이지의 데이터만 표시
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setNotices(allNotices.slice(startIndex, endIndex));
  }, [allNotices, currentPage]);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("state", true)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching notices:", error);
      } else {
        setAllNotices(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2">
        {/* 이전 버튼 */}
        {currentPage > 1 && (
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            ← 이전
          </button>
        )}

        {/* 페이지 정보 */}
        <span className="px-3 py-1 text-sm text-gray-600">
          {currentPage} / {totalPages}
        </span>

        {/* 다음 버튼 */}
        {currentPage < totalPages && (
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
          >
            다음 →
          </button>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="my-4 flex flex-col gap-5">
        <div className="text-center py-4">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="my-4 flex flex-col gap-4">
      {/* 검색창 */}
      <div className="">
        <input
          type="text"
          placeholder="공지사항 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 검색 결과 카운트 */}
      {searchTerm && (
        <div className="text-sm text-gray-600 mb-2">
          검색 결과: {allNotices.length}개
        </div>
      )}

      {notices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
        </div>
      ) : (
        <>
          {notices.map((notice) => (
            <Link key={notice.id} href={`/notice/${notice.id}`}>
              <div className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="text-[16px] font-bold mb-2">{notice.title}</div>
                <div className="text-[14px] text-[#555D6D] mb-2 line-clamp-2">
                  {notice.content}
                </div>
                <div className="flex justify-between items-center text-[12px] text-[#868B94]">
                  <span>
                    {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                  </span>
                  <span>조회수 {notice.views}</span>
                </div>
              </div>
            </Link>
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex">{renderPagination()}</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";

const supabase = createClient();

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

export default function HomeNoticeList() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("state", true)
        .order("created_at", { ascending: false })
        .limit(5); // 홈 화면에서는 최대 5개만

      if (error) {
        console.error("Error fetching notices:", error);
      } else {
        setNotices(data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
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
      {notices.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          등록된 공지사항이 없습니다.
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

          {/* 더보기 버튼 */}
          {notices.length === 5 && (
            <div className="text-center">
              <Link href="/notice">
                <button className="text-[14px] text-blue-600 hover:text-blue-800 font-medium">
                  공지사항 더보기 →
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}

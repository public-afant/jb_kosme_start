"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useParams, useRouter } from "next/navigation";

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

export default function NoticeDetail() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState(true);
  const LS_KEY = "read_notice_ids";

  useEffect(() => {
    if (params.id) {
      fetchNotice(params.id as string);
    }
  }, [params.id]);

  const fetchNotice = async (id: string) => {
    try {
      // 공지사항 데이터 가져오기
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("id", id)
        .eq("state", true)
        .single();

      if (error) {
        console.error("Error fetching notice:", error);
        if (error.code === "PGRST116") {
          // 데이터가 없는 경우
          router.push("/notice");
        }
      } else {
        setNotice(data);

        // 조회수 증가
        await supabase
          .from("notice")
          .update({ views: (data.views || 0) + 1 })
          .eq("id", id);

        // 읽음 처리: 로컬스토리지에 저장
        try {
          const raw =
            typeof window !== "undefined" ? localStorage.getItem(LS_KEY) : null;
          const ids: string[] = raw ? JSON.parse(raw) : [];
          if (!ids.includes(String(id))) {
            const next = [...ids, String(id)];
            localStorage.setItem(LS_KEY, JSON.stringify(next));
          }
        } catch (_) {
          // ignore
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8 text-gray-500">
          공지사항을 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 px-3">
      {/* 뒤로가기 버튼
      <button
        onClick={() => router.back()}
        className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
      >
        <svg
          className="w-5 h-5 mr-2"
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
        목록으로
      </button> */}

      {/* 공지사항 내용 */}
      <div className="bg-white">
        {/* 제목 */}
        <h1 className="text-2xl font-bold mb-4 text-gray-900">
          {notice.title}
        </h1>

        {/* 메타 정보 */}
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <div className="text-sm text-gray-500">
            작성일:{" "}
            {new Date(notice.created_at).toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="text-sm text-gray-500">조회수 {notice.views}</div>
        </div>

        {/* 내용 */}
        <div className="prose max-w-none">
          <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
            {notice.content}
          </div>
        </div>

        {/* 수정일 표시 (수정된 경우) */}
        {notice.updated_at !== notice.created_at && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              수정일:{" "}
              {new Date(notice.updated_at).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const supabase = createClient();

type Notice = {
  id: string;
  fk_user_id: string;
  title: string;
  content: string;
  views: number;
  state: boolean;
  created_at: string;
  updated_at: string;
  user_name?: string;
};

export default function AdminNoticePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteNoticeId, setDeleteNoticeId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("notice")
        .select(
          `
          *,
          users:fk_user_id(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        setError("공지사항 데이터를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      const noticesWithUserName =
        data?.map((notice) => ({
          ...notice,
          user_name: notice.users?.name || "알 수 없음",
        })) || [];

      setNotices(noticesWithUserName);
    } catch (e) {
      setError("공지사항 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = async (noticeId: string, currentState: boolean) => {
    setSwitchLoading(noticeId);
    const { error } = await supabase
      .from("notice")
      .update({ state: !currentState })
      .eq("id", noticeId);
    setSwitchLoading(null);
    if (!error) {
      setNotices((prev) =>
        prev.map((n) =>
          n.id === noticeId ? { ...n, state: !currentState } : n
        )
      );
    } else {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteNoticeId) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from("notice")
      .delete()
      .eq("id", deleteNoticeId);
    setDeleting(false);
    if (error) {
      setDeleteError("삭제에 실패했습니다: " + error.message);
    } else {
      setDeleteNoticeId(null);
      fetchNotices();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="px-3 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mt-2 mb-1">
        <h1 className="text-2xl font-bold">공지사항 관리</h1>
        <button
          className="flex items-center gap-1 px-4 py-1.5 rounded-2xl text-sm border bg-[#2A3995] text-white"
          onClick={() => router.push("/admin/notice/write")}
        >
          추가
        </button>
      </div>
      {loading ? (
        <div className="text-center py-10 text-gray-500">로딩 중...</div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">{error}</div>
      ) : (
        <ul>
          {notices.map((notice) => (
            <li
              key={notice.id}
              className="p-4 flex items-center gap-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{notice.title}</h3>
                </div>
                <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {notice.content}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>작성자: {notice.user_name}</span>
                  <span>조회수: {notice.views}</span>
                  <span>작성일: {formatDate(notice.created_at)}</span>
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {/* state 스위치 */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${
                      notice.state
                        ? "bg-[#2A3995] border-[#2A3995]"
                        : "bg-gray-200 border-gray-300"
                    }`}
                    onClick={() => handleToggleState(notice.id, notice.state)}
                    disabled={switchLoading === notice.id}
                    aria-label="활성/비활성 토글"
                  >
                    <span
                      className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        notice.state ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {/* 수정/삭제 버튼 */}
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() =>
                      router.push(`/admin/notice/edit/${notice.id}`)
                    }
                  >
                    수정
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    onClick={() => setDeleteNoticeId(notice.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {deleteNoticeId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-4">정말 삭제하시겠습니까?</h2>
            {deleteError && (
              <div className="text-red-500 text-sm mb-2">{deleteError}</div>
            )}
            <div className="flex gap-2 mt-6 justify-center">
              <button
                onClick={() => setDeleteNoticeId(null)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

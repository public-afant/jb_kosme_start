"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const supabase = createClient();

type Event = {
  id: string;
  fk_user_id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  state: boolean;
  created_at: string;
  updated_at: string;
  url?: string;
  user_name?: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [switchLoading, setSwitchLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("events")
        .select(
          `
          *,
          users:fk_user_id(name)
        `
        )
        .order("date", { ascending: false });

      if (error) {
        setError("행사일정 데이터를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      const eventsWithUserName =
        data?.map((event) => ({
          ...event,
          user_name: event.users?.name || "알 수 없음",
        })) || [];

      setEvents(eventsWithUserName);
    } catch (e) {
      setError("행사일정 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleState = async (eventId: string, currentState: boolean) => {
    setSwitchLoading(eventId);
    const { error } = await supabase
      .from("events")
      .update({ state: !currentState })
      .eq("id", eventId);
    setSwitchLoading(null);
    if (!error) {
      setEvents((prev) =>
        prev.map((e) => (e.id === eventId ? { ...e, state: !currentState } : e))
      );
    } else {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!deleteEventId) return;
    setDeleting(true);
    setDeleteError(null);
    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", deleteEventId);
    setDeleting(false);
    if (error) {
      setDeleteError("삭제에 실패했습니다: " + error.message);
    } else {
      setDeleteEventId(null);
      fetchEvents();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // HH:MM 형식으로 변환
  };

  return (
    <div className="px-3 py max-w-4xl mx-auto">
      <div className="flex items-center justify-between mt-2 mb-1">
        <h1 className="text-2xl font-bold">행사일정 관리</h1>
        <button
          className="flex items-center gap-1 px-4 py-1.5 rounded-2xl text-sm border bg-[#2A3995] text-white"
          onClick={() => router.push("/admin/events/write")}
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
          {events.map((event) => (
            <li
              key={event.id}
              className="py-4 px-2 flex items-center gap-4 border-b border-gray-200 last:border-b-0"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg truncate">{event.title}</h3>
                </div>
                <div className="text-gray-600 text-sm mb-2 line-clamp-2">
                  {/* {event.content} */}
                  <span className="text-gray-500 text-sm font-semibold">
                    {formatDate(event.date)} {formatTime(event.time)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>작성일: {formatDate(event.created_at)}</span>
                  {event.url && (
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      링크
                    </a>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {/* state 스위치 */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${
                      event.state
                        ? "bg-[#2A3995] border-[#2A3995]"
                        : "bg-gray-200 border-gray-300"
                    }`}
                    onClick={() => handleToggleState(event.id, event.state)}
                    disabled={switchLoading === event.id}
                    aria-label="활성/비활성 토글"
                  >
                    <span
                      className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                        event.state ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                {/* 수정/삭제 버튼 */}
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() =>
                      router.push(`/admin/events/edit/${event.id}`)
                    }
                  >
                    수정
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                    onClick={() => setDeleteEventId(event.id)}
                  >
                    삭제
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      {deleteEventId && (
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
                onClick={() => setDeleteEventId(null)}
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

"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { use } from "react";

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
};

export default function AdminEventsEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    state: true,
    url: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("행사일정을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      setEvent(data);

      // 날짜를 YYYY-MM-DD 형식으로 변환
      const dateObj = new Date(data.date);
      const formattedDate = dateObj.toISOString().split("T")[0];

      // 시간을 HH:MM 형식으로 변환 (time이 있는 경우)
      let formattedTime = "";
      if (data.time) {
        // time이 이미 HH:MM 형식이면 그대로 사용, 아니면 변환
        if (data.time.includes(":")) {
          formattedTime = data.time.substring(0, 5); // HH:MM만 추출
        } else {
          // ISO 시간 문자열인 경우 HH:MM으로 변환
          const timeObj = new Date(`2000-01-01T${data.time}`);
          formattedTime = timeObj.toTimeString().substring(0, 5);
        }
      }

      setForm({
        title: data.title,
        content: data.content,
        date: formattedDate,
        time: formattedTime,
        state: data.state,
        url: data.url || "",
      });
    } catch (e) {
      setError("행사일정을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim() || !form.date.trim()) {
      setError("제목, 내용, 날짜를 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("events")
      .update({
        title: form.title.trim(),
        content: form.content.trim(),
        date: form.date,
        time: form.time,
        state: form.state,
        url: form.url.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);
    if (error) {
      setError("행사일정 수정에 실패했습니다: " + error.message);
    } else {
      router.push("/admin/events");
    }
  };

  const handleCancel = () => {
    if (
      form.title !== event?.title ||
      form.content !== event?.content ||
      form.date !== event?.date ||
      form.time !== (event?.time || "") ||
      form.state !== event?.state ||
      form.url !== (event?.url || "")
    ) {
      if (confirm("수정 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        router.push("/admin/events");
      }
    } else {
      router.push("/admin/events");
    }
  };

  if (loading) {
    return (
      <div className="px-3 max-w-4xl mx-auto py-6">
        <div className="text-center py-10 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="px-3 max-w-4xl mx-auto py-6">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">
            {error || "행사일정을 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => router.push("/admin/events")}
            className="px-4 py-2 bg-[#2A3995] text-white rounded hover:bg-[#1f2b7a]"
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 max-w-4xl mx-auto py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">행사일정 수정</h1>
        <div className="flex gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-[#2A3995] text-white rounded hover:bg-[#1f2b7a] disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>

      {/* 폼 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent"
            placeholder="행사일정 제목을 입력하세요"
            maxLength={100}
          />
          <div className="mt-1 text-sm text-gray-500">
            {form.title.length}/100
          </div>
        </div>

        {/* 날짜 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            날짜 *
          </label>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent"
          />
        </div>

        {/* 시간 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시간
          </label>
          <input
            name="time"
            type="time"
            value={form.time}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent"
          />
        </div>

        {/* 내용 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            내용 *
          </label>
          <textarea
            name="content"
            value={form.content}
            onChange={handleChange}
            rows={10}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent resize-none"
            placeholder="행사일정 내용을 입력하세요"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL
          </label>
          <input
            name="url"
            type="url"
            value={form.url}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent"
            placeholder="https://example.com (선택사항)"
          />
          <p className="mt-1 text-sm text-gray-500">
            행사와 관련된 링크가 있다면 입력하세요. 입력 시 바로가기 버튼이
            표시됩니다.
          </p>
        </div>

        {/* 활성화 여부 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="state"
              checked={form.state}
              onChange={handleChange}
              className="w-4 h-4 text-[#2A3995] border-gray-300 rounded focus:ring-[#2A3995]"
            />
            <span className="ml-2 text-sm text-gray-700">활성화</span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            비활성화된 행사일정은 사용자에게 표시되지 않습니다.
          </p>
        </div>

        {/* 행사일정 정보 */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            행사일정 정보
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">작성일:</span>{" "}
              {new Date(event.created_at).toLocaleDateString("ko-KR")}
            </div>
            <div>
              <span className="font-medium">행사일:</span>{" "}
              {new Date(event.date).toLocaleDateString("ko-KR")}
            </div>
            {event.updated_at !== event.created_at && (
              <div className="col-span-2">
                <span className="font-medium">최종 수정일:</span>{" "}
                {new Date(event.updated_at).toLocaleDateString("ko-KR")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function AdminEventsWritePage() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    date: "",
    time: "",
    state: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

    // 현재 로그인한 유저 정보 가져오기
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      setError("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase.from("events").insert({
      fk_user_id: user.id,
      title: form.title.trim(),
      content: form.content.trim(),
      date: form.date,
      time: form.time,
      state: form.state,
    });

    setSaving(false);
    if (error) {
      setError("행사일정 추가에 실패했습니다: " + error.message);
    } else {
      router.push("/admin/events");
    }
  };

  const handleCancel = () => {
    if (form.title.trim() || form.content.trim() || form.date.trim()) {
      if (confirm("작성 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        router.push("/admin/events");
      }
    } else {
      router.push("/admin/events");
    }
  };

  return (
    <div className="px-3 max-w-4xl mx-auto py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">행사일정 작성</h1>
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
      </div>
    </div>
  );
}

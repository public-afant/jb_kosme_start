"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { use } from "react";

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
};

export default function AdminNoticeEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [form, setForm] = useState({
    title: "",
    content: "",
    state: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchNotice();
  }, [id]);

  const fetchNotice = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("notice")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("공지사항을 불러오는 중 오류가 발생했습니다.");
        return;
      }

      setNotice(data);
      setForm({
        title: data.title,
        content: data.content,
        state: data.state,
      });
    } catch (e) {
      setError("공지사항을 불러오는 중 오류가 발생했습니다.");
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
    if (!form.title.trim() || !form.content.trim()) {
      setError("제목과 내용을 모두 입력해주세요.");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from("notice")
      .update({
        title: form.title.trim(),
        content: form.content.trim(),
        state: form.state,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);
    if (error) {
      setError("공지사항 수정에 실패했습니다: " + error.message);
    } else {
      router.push("/admin/notice");
    }
  };

  const handleCancel = () => {
    if (
      form.title !== notice?.title ||
      form.content !== notice?.content ||
      form.state !== notice?.state
    ) {
      if (confirm("수정 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        router.push("/admin/notice");
      }
    } else {
      router.push("/admin/notice");
    }
  };

  if (loading) {
    return (
      <div className="px-3 max-w-4xl mx-auto py-6">
        <div className="text-center py-10 text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="px-3 max-w-4xl mx-auto py-6">
        <div className="text-center py-10">
          <div className="text-red-500 mb-4">
            {error || "공지사항을 찾을 수 없습니다."}
          </div>
          <button
            onClick={() => router.push("/admin/notice")}
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
        <h1 className="text-2xl font-bold">공지사항 수정</h1>
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
            placeholder="공지사항 제목을 입력하세요"
            maxLength={100}
          />
          <div className="mt-1 text-sm text-gray-500">
            {form.title.length}/100
          </div>
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
            rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#2A3995] focus:border-transparent resize-none"
            placeholder="공지사항 내용을 입력하세요"
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
            비활성화된 공지사항은 사용자에게 표시되지 않습니다.
          </p>
        </div>

        {/* 공지사항 정보 */}
        <div className="border-t pt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            공지사항 정보
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">작성일:</span>{" "}
              {new Date(notice.created_at).toLocaleDateString("ko-KR")}
            </div>
            <div>
              <span className="font-medium">조회수:</span> {notice.views}
            </div>
            {notice.updated_at !== notice.created_at && (
              <div className="col-span-2">
                <span className="font-medium">최종 수정일:</span>{" "}
                {new Date(notice.updated_at).toLocaleDateString("ko-KR")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

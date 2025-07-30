"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import Link from "next/link";

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
  created_at: string;
};

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) {
        setError("배너 데이터를 불러오는 중 오류가 발생했습니다.");
        return;
      }
      setBanners(data || []);
    } catch (e) {
      setError("배너 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    setDeleteError(null);

    const { error } = await supabase
      .from("banners")
      .delete()
      .eq("id", deleteId);

    setDeleting(false);
    if (error) {
      setDeleteError("삭제에 실패했습니다.");
    } else {
      setDeleteId(null);
      fetchBanners();
    }
  };

  const handleToggleActive = async (banner: Banner) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !banner.is_active })
      .eq("id", banner.id);

    if (!error) {
      setBanners((prev) =>
        prev.map((b) =>
          b.id === banner.id ? { ...b, is_active: !b.is_active } : b
        )
      );
    } else {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  const isActive = (banner: Banner) => {
    const today = new Date().toISOString().split("T")[0];
    return (
      banner.is_active && banner.start_date <= today && banner.end_date >= today
    );
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  if (loading) {
    return (
      <div className="px-3 max-w-2xl mx-auto">
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="px-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">배너 관리</h1>
        <Link
          href="/admin/banners/write"
          className="flex items-center gap-1 px-4 py-1.5 rounded-2xl text-sm border bg-[#2A3995] text-white"
        >
          추가
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="bg-white rounded-xl shadow-sm border p-4"
          >
            <div className="flex items-start gap-4">
              {/* 배너 이미지 */}
              <div className="w-20 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  width={80}
                  height={64}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 배너 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {banner.title}
                  </h3>
                  <div className="flex items-center gap-2 ml-2">
                    {/* 활성/비활성 스위치 */}
                    <button
                      onClick={() => handleToggleActive(banner)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#2A3995] focus:ring-offset-2 ${
                        banner.is_active ? "bg-[#2A3995]" : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          banner.is_active ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isActive(banner) ? "bg-green-500" : "bg-gray-300"
                      }`}
                    />
                    <span>
                      {formatDate(banner.start_date)} ~{" "}
                      {formatDate(banner.end_date)}
                    </span>
                    {isActive(banner) && (
                      <span className="text-green-600 text-xs font-medium">
                        활성
                      </span>
                    )}
                  </div>
                  {banner.link_url && (
                    <div className="text-xs text-blue-600 truncate">
                      링크: {banner.link_url}
                    </div>
                  )}
                  <div className="text-xs text-gray-500">
                    순서: {banner.order_index}
                  </div>
                </div>
              </div>

              {/* 액션 버튼들 */}
              <div className="flex flex-col gap-2 ml-2">
                <Link
                  href={`/admin/banners/edit/${banner.id}`}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  수정
                </Link>
                <button
                  onClick={() => setDeleteId(banner.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        ))}

        {banners.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            등록된 배너가 없습니다.
          </div>
        )}
      </div>

      {/* 삭제 확인 모달 */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold mb-4">배너 삭제</h2>
            <p className="text-gray-600 mb-6">
              이 배너를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 transition-colors"
              >
                {deleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

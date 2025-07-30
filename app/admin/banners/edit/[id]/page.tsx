"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";

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
  updated_at: string;
};

export default function AdminBannerEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [banner, setBanner] = useState<Banner | null>(null);
  const [form, setForm] = useState({
    title: "",
    image_url: "",
    link_url: "",
    start_date: "",
    end_date: "",
    is_active: true,
    order_index: 0,
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("/icon/profile-empty.png");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // 배너 데이터 불러오기
  const fetchBanner = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError("배너를 찾을 수 없습니다.");
        return;
      }

      setBanner(data);
      setForm({
        title: data.title,
        image_url: data.image_url,
        link_url: data.link_url || "",
        start_date: data.start_date,
        end_date: data.end_date,
        is_active: data.is_active,
        order_index: data.order_index,
      });
      setImagePreview(data.image_url);
    } catch (error) {
      setError("배너 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const uploadBannerImage = async (file: File): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "banner");

      const response = await fetch("/api/banner-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        console.error("Upload failed:", response.statusText);
        return null;
      }

      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let imageUrl = form.image_url;

      // 새 이미지 업로드
      if (profileImage) {
        const uploadedUrl = await uploadBannerImage(profileImage);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setError("이미지 업로드에 실패했습니다.");
          setSaving(false);
          return;
        }
      }

      // 배너 수정
      const { error: updateError } = await supabase
        .from("banners")
        .update({
          title: form.title.trim(),
          image_url: imageUrl,
          link_url: form.link_url.trim() || null,
          start_date: form.start_date,
          end_date: form.end_date,
          is_active: form.is_active,
          order_index: form.order_index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (updateError) {
        setError("배너 수정에 실패했습니다: " + updateError.message);
        return;
      }

      alert("배너가 성공적으로 수정되었습니다.");
      router.push("/admin/banners");
    } catch (error) {
      setError("배너 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      form.title !== banner?.title ||
      form.image_url !== banner?.image_url ||
      form.link_url !== (banner?.link_url || "") ||
      form.start_date !== banner?.start_date ||
      form.end_date !== banner?.end_date ||
      form.is_active !== banner?.is_active ||
      form.order_index !== banner?.order_index ||
      profileImage
    ) {
      if (confirm("수정 중인 내용이 있습니다. 정말 나가시겠습니까?")) {
        router.push("/admin/banners");
      }
    } else {
      router.push("/admin/banners");
    }
  };

  useEffect(() => {
    fetchBanner();
  }, [id]);

  if (loading) {
    return (
      <div className="px-3 max-w-2xl mx-auto">
        <div className="text-center py-8">로딩 중...</div>
      </div>
    );
  }

  if (!banner) {
    return (
      <div className="px-3 max-w-2xl mx-auto">
        <div className="text-center py-8 text-red-600">
          배너를 찾을 수 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="px-3 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">배너 수정</h1>
        <button
          onClick={handleCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          취소
        </button>
      </div>

      {/* 배너 정보 */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 space-y-1">
          <div>
            생성일: {new Date(banner.created_at).toLocaleDateString("ko-KR")}
          </div>
          <div>
            수정일: {new Date(banner.updated_at).toLocaleDateString("ko-KR")}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 배너 이미지 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            배너 이미지 *
          </label>
          <div className="flex flex-col items-center">
            <div className="relative w-80" style={{ aspectRatio: "2/3" }}>
              <Image
                src={imagePreview}
                alt="배너 이미지"
                width={320}
                height={480}
                className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer"
                onClick={handleImageClick}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                <span className="text-white opacity-0 hover:opacity-100 transition-opacity text-sm">
                  클릭하여 이미지 변경
                </span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <button
              type="button"
              onClick={handleImageClick}
              className="mt-3 px-4 py-2 bg-[#2A3995] text-white rounded-lg hover:bg-[#1f2b7a] transition-colors text-sm"
            >
              이미지 선택
            </button>
            <p className="text-xs text-gray-500 mt-2">
              권장 크기: 400x600px (2:3 비율)
            </p>
          </div>
        </div>

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제목 *
          </label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
            maxLength={100}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
            placeholder="배너 제목을 입력하세요"
          />
        </div>

        {/* 링크 URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            링크 URL (선택사항)
          </label>
          <input
            type="url"
            name="link_url"
            value={form.link_url}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
            placeholder="https://example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            클릭 시 이동할 URL을 입력하세요
          </p>
        </div>

        {/* 시작일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            시작일 *
          </label>
          <input
            type="date"
            name="start_date"
            value={form.start_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
        </div>

        {/* 종료일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            종료일 *
          </label>
          <input
            type="date"
            name="end_date"
            value={form.end_date}
            onChange={handleChange}
            required
            min={form.start_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
        </div>

        {/* 순서 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            표시 순서
          </label>
          <input
            type="number"
            name="order_index"
            value={form.order_index}
            onChange={handleChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
            placeholder="0"
          />
          <p className="text-xs text-gray-500 mt-1">
            숫자가 작을수록 먼저 표시됩니다
          </p>
        </div>

        {/* 활성화 여부 */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_active"
              checked={form.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-[#2A3995] border-gray-300 rounded focus:ring-[#2A3995]"
            />
            <span className="ml-2 text-sm text-gray-700">활성화</span>
          </label>
          <p className="text-xs text-gray-500 mt-1">
            체크하면 배너가 표시됩니다
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2 bg-[#2A3995] text-white rounded-lg hover:bg-[#1f2b7a] disabled:bg-gray-300 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
}

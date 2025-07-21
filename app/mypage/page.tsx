"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

const supabase = createClient();

type User = {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  company_name: string;
  class_of: string;
  role: string;
  logo_url?: string;
  item?: string[];
  created_at: string;
  updated_at: string;
};

export default function Mypage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    phone_number: "",
  });
  const [items, setItems] = useState<string[]>([]);
  const [newItem, setNewItem] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // 현재 로그인한 사용자 정보 가져오기
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        console.error("Auth error:", authError);
        router.push("/login");
        return;
      }

      // user_with_email view에서 사용자 정보 가져오기
      const { data: userData, error: userError } = await supabase
        .from("user_with_email")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (userError) {
        console.error("User data error:", userError);
        return;
      }

      setUser(userData);
      setFormData({
        company_name: userData.company_name || "",
        phone_number: userData.phone_number || "",
      });
      setItems(userData.item || []);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const handleAddItem = () => {
    if (newItem.trim() && items.length < 3) {
      setItems([...items, newItem.trim()]);
      setNewItem("");
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const uploadProfileImage = async (
    file: File,
    userId: string
  ): Promise<string | null> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/profile-upload", {
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

  const handleSave = async () => {
    if (!user) return;

    try {
      let logoUrl: string | null = user.logo_url || null;

      // 기본 이미지로 변경하는 경우
      if (imagePreview === "/icon/profile-empty.png" && user.logo_url) {
        // Storage에서 파일 삭제
        const response = await fetch("/api/profile-upload", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (!response.ok) {
          console.error("Delete failed:", response.statusText);
          alert("기본 이미지로 변경에 실패했습니다.");
          return;
        }

        logoUrl = null;
      }
      // 새로운 프로필 이미지 업로드
      else if (profileImage) {
        const uploadedUrl = await uploadProfileImage(profileImage, user.id);
        if (uploadedUrl) {
          logoUrl = uploadedUrl;
        }
      }

      const { error } = await supabase
        .from("users")
        .update({
          company_name: formData.company_name,
          phone_number: formData.phone_number,
          logo_url: logoUrl,
          item: items,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        console.error("Update error:", error);
        alert("정보 수정에 실패했습니다.");
        return;
      }

      alert("정보가 성공적으로 수정되었습니다.");
      setShowModal(false);
      setProfileImage(null);
      setImagePreview("");
      fetchUserData(); // 데이터 새로고침

      // 헤더 업데이트를 위한 이벤트 발생
      window.dispatchEvent(new Event("profileImageUpdated"));
    } catch (error) {
      console.error("Error:", error);
      alert("정보 수정에 실패했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error);
        return;
      }
      router.push("/login");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleResetProfileImage = () => {
    // 프리뷰를 기본 이미지로 변경
    setImagePreview("/icon/profile-empty.png");
    setProfileImage(null);
  };

  const openEditModal = () => {
    setFormData({
      company_name: user?.company_name || "",
      phone_number: user?.phone_number || "",
    });
    setItems(user?.item || []);
    setProfileImage(null);
    setImagePreview("");
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">사용자 정보를 불러올 수 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-gray-50">
      <div className="max-w-2xl mx-auto p-3 ">
        {/* 헤더 */}
        <div className="mb-10 mt-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">마이페이지</h1>
          <p className="text-gray-600">
            내 정보를 확인하고 수정할 수 있습니다.
          </p>
        </div>

        {/* 명함 스타일 프로필 카드 */}
        <div className="bg-white rounded-xl shadow-xl px-4 pt-10 pb-6 w-[220px]  mx-auto flex flex-col items-center relative mb-6">
          {/* 표시 모드 - 프로필 이미지 */}
          <Image
            src={
              user.logo_url
                ? `${user.logo_url}?t=${user.updated_at}&v=${Date.now()}`
                : "/icon/profile-empty.png"
            }
            alt="프로필 이미지"
            width={100}
            height={100}
            className="w-25 h-25 object-cover bg-white border border-gray-200 rounded-full mb-5"
          />

          {/* 표시 모드 - 태그들 */}
          {Array.isArray(user.item) && user.item.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5 justify-center">
              {user.item.map((tag: string, idx: number) => (
                <span
                  key={idx}
                  className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 표시 모드 - 사용자 정보 */}
          <div className="flex flex-col items-end w-full mt-10">
            <div className="font-bold text-xl">
              {user.name}{" "}
              <span className="text-base text-gray-500">
                ({user.class_of}기)
              </span>
            </div>
            <div className="text-gray-700 font-semibold text-[16px]">
              {user.company_name || "회사명 미입력"}
            </div>
            <div className="text-gray-500 text-sm mb-1">
              {user.email || "이메일 미입력"}
            </div>
            {/* <div className="text-gray-500 text-sm">
              {user.phone_number || "전화번호 미입력"}
            </div> */}
          </div>

          {/* 수정 버튼 */}
          <button
            onClick={openEditModal}
            className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white text-xs rounded-full hover:bg-blue-600 transition-colors"
          >
            수정
          </button>
        </div>

        {/* 하단 여백 */}
        <div className="h-20"></div>
      </div>

      {/* 하단 고정 로그아웃 버튼 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 text-center">
        <button
          onClick={handleLogout}
          className="text-red-500 hover:text-red-700 text-sm font-medium transition-colors"
        >
          로그아웃
        </button>
      </div>

      {/* 수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">정보 수정</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 프로필 이미지 */}
              <div className="text-center">
                <div className="relative inline-block">
                  <Image
                    src={
                      imagePreview ||
                      (user.logo_url
                        ? `${user.logo_url}?t=${
                            user.updated_at
                          }&v=${Date.now()}`
                        : "/icon/profile-empty.png")
                    }
                    alt="프로필 이미지"
                    width={100}
                    height={100}
                    className="w-25 h-25 object-cover bg-white border border-gray-200 rounded-full"
                  />
                  {/* 모바일 친화적 변경 버튼 */}
                  <button
                    onClick={() =>
                      document.getElementById("profile-image-input")?.click()
                    }
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>
                  {/* 숨겨진 파일 입력 */}
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <div className="flex gap-2 mt-3 justify-center items-center">
                  <p className="text-xs text-gray-500">
                    우하단 + 버튼을 눌러 이미지를 변경하세요
                  </p>
                  {user.logo_url && (
                    <button
                      onClick={handleResetProfileImage}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                      title="기본 이미지로 변경"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* 회사명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회사명
                </label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 전화번호 */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호
                </label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div> */}

              {/* 아이템 태그 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  태그 (최대 3개)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="새 태그 입력"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === "Enter" && handleAddItem()}
                  />
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.trim() || items.length >= 3}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    추가
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {items.map((item, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {item}
                      <button
                        onClick={() => handleRemoveItem(index)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {items.length}/3개 태그
                </p>
              </div>

              {/* 버튼 */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  저장
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

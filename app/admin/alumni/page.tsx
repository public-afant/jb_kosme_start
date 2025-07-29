"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const supabase = createClient();

type User = {
  id: string;
  state: boolean;
  class_of: number;
  company_name: string;
  name: string;
  phone_number: string;
  email: string;
  logo_url?: string;
  role: string;
  created_at: string;
};

type EditUser = Omit<User, "created_at">;

function AdminAlumniEditModal({
  user,
  onClose,
  onSave,
}: {
  user: EditUser;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<EditUser>(user);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    user.logo_url || "/icon/profile-empty.png"
  );
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };
  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, class_of: Number(e.target.value) }));
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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    let logoUrl = form.logo_url;
    // 프로필 이미지 업로드
    if (profileImage) {
      const formData = new FormData();
      formData.append("file", profileImage);
      formData.append("userId", form.id);
      const response = await fetch("/api/profile-upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        logoUrl = data.url;
      }
    }
    const { error } = await supabase
      .from("users")
      .update({
        name: form.name,
        company_name: form.company_name,
        phone_number: form.phone_number,
        class_of: form.class_of,
        logo_url: logoUrl,
      })
      .eq("id", form.id);
    setSaving(false);
    if (error) {
      setError("수정에 실패했습니다.");
    } else {
      onSave();
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">동문 정보 수정</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center mb-2">
            <Image
              src={imagePreview}
              alt="프로필 이미지"
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-full border border-gray-200 mb-2 cursor-pointer"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <span className="text-xs text-gray-400">이미지를 클릭해 변경</span>
          </div>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">이름</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">회사명</span>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">전화번호</span>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">기수</span>
            <select
              name="class_of"
              value={form.class_of}
              onChange={handleClassChange}
              className="border rounded px-3 py-2"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}기
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="flex gap-2 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminAlumniAddModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    phone_number: "",
    class_of: 1,
    logo_url: "",
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(
    "/icon/profile-empty.png"
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
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

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    let logoUrl = form.logo_url;
    // 1. Supabase Auth에 회원 생성
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp(
      {
        email: form.email,
        password: form.password,
        options: {
          data: { display_name: form.name },
        },
      }
    );
    if (signUpError || !signUpData.user) {
      setSaving(false);
      setError(
        "회원 인증 생성에 실패했습니다: " + (signUpError?.message || "")
      );
      return;
    }
    const userId = signUpData.user.id;
    // 2. 프로필 이미지 업로드
    if (profileImage) {
      const formData = new FormData();
      formData.append("file", profileImage);
      formData.append("userId", userId);
      const response = await fetch("/api/profile-upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        const data = await response.json();
        logoUrl = data.url;
      }
    }
    // 3. users 테이블에 정보 추가
    const { error: userError } = await supabase.from("users").insert({
      id: userId,
      name: form.name,
      company_name: form.company_name,
      phone_number: form.phone_number,
      class_of: form.class_of,
      logo_url: logoUrl,
      state: true,
      role: "user",
    });
    setSaving(false);
    if (userError) {
      setError("동문 정보 추가에 실패했습니다: " + userError.message);
    } else {
      onSave();
      onClose();
    }
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, class_of: Number(e.target.value) }));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">동문 추가</h2>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col items-center mb-2">
            <Image
              src={imagePreview}
              alt="프로필 이미지"
              width={80}
              height={80}
              className="w-20 h-20 object-cover rounded-full border border-gray-200 mb-2 cursor-pointer"
              onClick={handleImageClick}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              ref={fileInputRef}
            />
            <span className="text-xs text-gray-400">이미지를 클릭해 변경</span>
          </div>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">이메일</span>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              className="border border-gray-400 rounded px-3 py-2"
              placeholder="ex) user@email.com"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">비밀번호</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="border border-gray-400 rounded px-3 py-2"
              placeholder="8자 이상 영문, 숫자 조합"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">이름</span>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="border border-gray-400 rounded px-3 py-2"
              placeholder="이름을 입력하세요"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">회사명</span>
            <input
              name="company_name"
              value={form.company_name}
              onChange={handleChange}
              className="border border-gray-400 rounded px-3 py-2"
              placeholder="회사명을 입력하세요"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">전화번호</span>
            <input
              name="phone_number"
              value={form.phone_number}
              onChange={handleChange}
              className="border border-gray-400 rounded px-3 py-2"
              placeholder="ex) 01012345678"
            />
          </label>
          <label className="flex flex-col">
            <span className="text-sm font-medium mb-1">기수</span>
            <select
              name="class_of"
              value={form.class_of}
              onChange={handleClassChange}
              className="border border-gray-400 rounded px-3 py-2"
            >
              {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}기
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        <div className="flex gap-2 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "저장 중..." : "추가"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAlumniPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<EditUser | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [tab, setTab] = useState<"alumni" | "approval">("alumni");
  const [switchLoading, setSwitchLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("user_with_email")
        .select(
          "id, state, class_of, company_name, name, phone_number, email, logo_url, role, created_at"
        )
        .eq("role", "user")
        .order("class_of", { ascending: true });
      if (error) {
        setError("동문 데이터를 불러오는 중 오류가 발생했습니다.");
        return;
      }
      setUsers(data || []);
    } catch (e) {
      setError("동문 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;
    setDeleting(true);
    setDeleteError(null);
    const response = await fetch("/api/admin-delete-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: deleteUserId }),
    });
    setDeleting(false);
    if (response.ok) {
      setDeleteUserId(null);
      fetchUsers();
    } else {
      const data = await response.json();
      setDeleteError(data.error || "삭제에 실패했습니다.");
    }
  };

  // state 토글 핸들러
  const handleToggleState = async (userId: string, currentState: boolean) => {
    setSwitchLoading(userId);
    const { error } = await supabase
      .from("users")
      .update({ state: !currentState })
      .eq("id", userId);
    setSwitchLoading(null);
    if (!error) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, state: !currentState } : u))
      );
    } else {
      alert("상태 변경에 실패했습니다.");
    }
  };

  // 승인 대기 중인 동문들만 필터링
  const pendingUsers = users.filter((user) => !user.state);
  // 활성화된 동문들만 필터링
  const activeUsers = users.filter((user) => user.state);

  return (
    <div className="px-3 max-w-2xl mx-auto">
      {/* 탭 UI */}
      <div className="flex gap-2 mt-2 mb-4">
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150 ${
            tab === "alumni"
              ? "border-[#2A3995] text-[#2A3995] bg-white"
              : "border-transparent text-gray-400 bg-gray-50"
          }`}
          onClick={() => setTab("alumni")}
        >
          동문 관리
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors duration-150 ${
            tab === "approval"
              ? "border-[#2A3995] text-[#2A3995] bg-white"
              : "border-transparent text-gray-400 bg-gray-50"
          }`}
          onClick={() => setTab("approval")}
        >
          승인 관리
        </button>
      </div>
      {/* 탭별 내용 */}
      {tab === "alumni" ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold">동문 관리</h1>
            <button
              className="flex items-center gap-1 px-4 py-1.5  rounded-2xl text-sm border bg-[#2A3995] text-white"
              onClick={() => setShowAdd(true)}
            >
              추가
            </button>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : activeUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-lg">
              활성화된 동문이 없습니다.
            </div>
          ) : (
            <ul>
              {activeUsers.map((user) => (
                <li
                  key={user.id}
                  className="p-3 flex items-center gap-4 border-b border-gray-200 last:border-b-0"
                >
                  <Image
                    src={user.logo_url || "/icon/profile-empty.png"}
                    alt="logo"
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover aspect-square bg-white border border-gray-200 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] truncate">
                      <span className="font-bold mr-1">{user.name}</span>
                      <span className="text-gray-700 text-[12px] font-semibold">
                        ({user.class_of}기)
                      </span>
                    </div>
                    <div className="text-gray-700 font-semibold truncate text-[14px]">
                      {user.company_name}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {user.email}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {user.phone_number}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {/* state 스위치 */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${
                          user.state
                            ? "bg-[#2A3995] border-[#2A3995]"
                            : "bg-gray-200 border-gray-300"
                        }`}
                        onClick={() => handleToggleState(user.id, user.state)}
                        disabled={switchLoading === user.id}
                        aria-label="활성/비활성 토글"
                      >
                        <span
                          className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            user.state ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {/* 수정/삭제 버튼 */}
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                        onClick={() => setEditUser(user)}
                      >
                        수정
                      </button>
                      <button
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {editUser && (
            <AdminAlumniEditModal
              user={editUser}
              onClose={() => setEditUser(null)}
              onSave={fetchUsers}
            />
          )}
          {showAdd && (
            <AdminAlumniAddModal
              onClose={() => setShowAdd(false)}
              onSave={fetchUsers}
            />
          )}
          {deleteUserId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold mb-4">
                  정말 삭제하시겠습니까?
                </h2>
                {deleteError && (
                  <div className="text-red-500 text-sm mb-2">{deleteError}</div>
                )}
                <div className="flex gap-2 mt-6 justify-center">
                  <button
                    onClick={() => setDeleteUserId(null)}
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
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold">승인 관리</h1>
          </div>
          {loading ? (
            <div className="text-center py-10 text-gray-500">로딩 중...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : pendingUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-lg">
              승인 대기 중인 동문이 없습니다.
            </div>
          ) : (
            <ul>
              {pendingUsers.map((user) => (
                <li
                  key={user.id}
                  className="p-3 flex items-center gap-4 border-b border-gray-200 last:border-b-0"
                >
                  <Image
                    src={user.logo_url || "/icon/profile-empty.png"}
                    alt="logo"
                    width={56}
                    height={56}
                    className="w-14 h-14 object-cover aspect-square bg-white border border-gray-200 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-[16px] truncate">
                      <span className="font-bold mr-1">{user.name}</span>
                      <span className="text-gray-700 text-[12px] font-semibold">
                        ({user.class_of}기)
                      </span>
                    </div>
                    <div className="text-gray-700 font-semibold truncate text-[14px]">
                      {user.company_name}
                    </div>
                    <div className="text-gray-500 text-xs truncate">
                      {user.email}
                    </div>
                    <div className="text-gray-400 text-xs truncate">
                      {user.phone_number}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    {/* state 스위치 */}
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        className={`w-10 h-6 flex items-center rounded-full border transition-colors duration-200 ${
                          user.state
                            ? "bg-[#2A3995] border-[#2A3995]"
                            : "bg-gray-200 border-gray-300"
                        }`}
                        onClick={() => handleToggleState(user.id, user.state)}
                        disabled={switchLoading === user.id}
                        aria-label="활성/비활성 토글"
                      >
                        <span
                          className={`inline-block w-5 h-5 rounded-full bg-white shadow transform transition-transform duration-200 ${
                            user.state ? "translate-x-4" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {/* 삭제 버튼만 */}
                    <div className="flex flex-col gap-1 ml-2">
                      <button
                        className="px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {deleteUserId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-xs mx-4 text-center"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-lg font-bold mb-4">
                  정말 삭제하시겠습니까?
                </h2>
                {deleteError && (
                  <div className="text-red-500 text-sm mb-2">{deleteError}</div>
                )}
                <div className="flex gap-2 mt-6 justify-center">
                  <button
                    onClick={() => setDeleteUserId(null)}
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
        </>
      )}
    </div>
  );
}

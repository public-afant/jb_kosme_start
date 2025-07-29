"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    // 로그인 성공 후 유저 정보 가져와서 state 확인
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("state")
        .eq("id", user.id)
        .single();

      if (userError) {
        setLoading(false);
        setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      if (!userData.state) {
        // state가 false면 로그아웃하고 승인 대기 모달 띄우기
        await supabase.auth.signOut();
        setLoading(false);
        setShowApprovalModal(true);
        return;
      }
    }

    // state가 true면 정상 로그인 진행
    setLoading(false);
    window.dispatchEvent(new Event("profileImageUpdated"));
    router.push("/");
  };

  return (
    <div className="h-full w-full flex justify-center items-center">
      <form className="flex flex-col items-center gap-2" onSubmit={handleLogin}>
        <div className="flex flex-col items-center">
          <Image
            src={"/icon/ic-Logo_2.png"}
            width={150}
            height={60}
            alt="title"
            className="mb-4"
          />
          <div className="text-lg font-semibold mb-4 text-[#033892]">
            전북청년창업사관학교 동문회
          </div>
        </div>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded w-full border-gray-300"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded w-full border-gray-300"
        />
        <button
          type="submit"
          className="bg-[#2A3995] text-white font-semibold mt-4 py-3 px-8 rounded w-full disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>

      {/* 승인 대기 모달 */}
      {showApprovalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4 text-center">
            <div className="text-2xl mb-4">⏳</div>
            <h2 className="text-lg font-bold mb-2">승인 대기중입니다</h2>
            <p className="text-gray-600 text-sm mb-6">
              관리자 승인 후 로그인이 가능합니다.
              <br />
              승인 완료까지 잠시만 기다려 주세요.
            </p>
            <button
              onClick={() => setShowApprovalModal(false)}
              className="px-6 py-2 bg-[#2A3995] text-white rounded-lg hover:bg-[#1f2b7a] transition-colors"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

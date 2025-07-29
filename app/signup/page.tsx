"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [classOf, setClassOf] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("올바른 이메일 형식을 입력해주세요.");
      return;
    }

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 비밀번호 길이 확인
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return;
    }

    // 기수 선택 확인
    if (!classOf) {
      setError("기수를 선택해주세요.");
      return;
    }

    setLoading(true);

    // 회원가입
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: name },
      },
    });

    if (authError) {
      setLoading(false);
      setError(authError.message);
      return;
    }

    if (authData.user) {
      // users 테이블에 추가 정보 저장
      const { error: userError } = await supabase.from("users").insert({
        id: authData.user.id,
        name: name.trim(),
        company_name: companyName.trim(),
        phone_number: phoneNumber.trim(),
        class_of: classOf as number,
        state: false, // 승인 대기 상태
        role: "user",
        item: [],
      });

      if (userError) {
        setLoading(false);
        setError("회원가입 중 오류가 발생했습니다: " + userError.message);
        return;
      }

      setLoading(false);
      setSuccess(true);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() === "") {
      setEmailError("");
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setEmailError("올바른 이메일 형식을 입력해주세요.");
      } else {
        setEmailError("");
      }
    }
  };

  const handleClose = () => {
    router.push("/login");
  };

  if (success) {
    return (
      <div className="h-full w-full flex justify-center items-center">
        <div className="w-full max-w-md mx-4 text-center">
          <div className="flex flex-col items-center mb-6">
            <Image
              src={"/icon/ic-Logo_2.png"}
              width={150}
              height={60}
              alt="title"
              className="mb-4"
            />
            <div className="text-lg font-semibold text-[#033892]">
              전북청년창업사관학교 동문회
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="text-2xl mb-4">✅</div>
            <h2 className="text-lg font-bold mb-2 text-green-800">
              회원가입 완료
            </h2>
            <p className="text-green-700 text-sm mb-6">
              회원가입이 성공적으로 완료되었습니다.
              <br />
              관리자 승인 후 로그인이 가능합니다.
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-[#2A3995] text-white rounded-lg hover:bg-[#1f2b7a] transition-colors"
            >
              창 닫기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="w-full max-w-md mx-4">
        {/* 로고 및 타이틀 */}
        <div className="flex flex-col items-center mb-6">
          <Image
            src={"/icon/ic-Logo_2.png"}
            width={80}
            height={60}
            alt="title"
            className="mb-4"
          />
          {/* <div className="text-lg font-semibold text-[#033892]">
            전북청년창업사관학교 동문회
          </div> */}
          {/* <div className="text-lg  text-gray-600 mt-2">회원가입</div> */}
        </div>

        {/* 회원가입 폼 */}
        <form className="flex flex-col gap-3" onSubmit={handleSignup}>
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={handleEmailChange}
            required
            className={`border p-3 rounded-lg focus:outline-none focus:ring-2 ${
              emailError
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#2A3995]"
            }`}
          />
          {emailError && (
            <div className="text-red-500 text-sm -mt-2">{emailError}</div>
          )}
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
          <input
            type="text"
            placeholder="회사명"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
          <input
            type="tel"
            placeholder="전화번호 (예: 01012345678)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
          <select
            value={classOf}
            onChange={(e) =>
              setClassOf(e.target.value === "" ? "" : Number(e.target.value))
            }
            required
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          >
            <option value="">기수를 선택하세요</option>
            {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
              <option key={num} value={num}>
                {num}기
              </option>
            ))}
          </select>
          <input
            type="password"
            placeholder="비밀번호 (6자 이상)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border p-3 rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2A3995]"
          />
          <button
            type="submit"
            className="bg-[#2A3995] text-white font-semibold py-3 px-8 rounded-lg w-full disabled:bg-gray-400 hover:bg-[#1f2b7a] transition-colors"
            disabled={loading}
          >
            {loading ? "회원가입 중..." : "회원가입"}
          </button>
        </form>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-500 text-sm mt-3 text-center">{error}</div>
        )}

        {/* 취소 버튼 */}
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleClose}
            className="text-gray-600 text-sm hover:underline"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

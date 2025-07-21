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
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      window.dispatchEvent(new Event("profileImageUpdated"));
      router.push("/");
    }
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
          className="border p-2 rounded w-full
           border-gray-300"
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
    </div>
  );
}

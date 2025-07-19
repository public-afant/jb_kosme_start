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
      router.push("/");
    }
  };

  return (
    <div className="h-screen w-screen flex justify-center items-center">
      <form className="flex flex-col items-center gap-4" onSubmit={handleLogin}>
        <div>
          <Image
            src={"/icon/ic-Logo_2.png"}
            width={150}
            height={60}
            alt="title"
            className="mb-10"
          />
        </div>
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 rounded w-60"
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 rounded w-60"
        />
        <button
          type="submit"
          className="bg-[#2A3995] text-white font-semibold py-2 px-8 rounded w-60 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "로그인 중..." : "로그인"}
        </button>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </form>
    </div>
  );
}

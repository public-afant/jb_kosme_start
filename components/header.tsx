"use client";
import Image from "next/image";
import Menu from "./menu-button";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

type User = {
  id: string;
  logo_url?: string;
  updated_at?: string;
};

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();

    // 커스텀 이벤트 리스너 추가
    const handleProfileUpdate = () => {
      fetchUserData();
    };

    window.addEventListener("profileImageUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileImageUpdated", handleProfileUpdate);
    };
  }, []);

  const fetchUserData = async () => {
    try {
      const {
        data: { user: authUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !authUser) {
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from("user_with_email")
        .select("id, logo_url, updated_at")
        .eq("id", authUser.id)
        .single();

      if (!userError && userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (pathname === "/login") return null;

  return (
    <div className="flex justify-between pb-3 px-3">
      <div className="flex items-center">
        <div className="mr-1">
          <Menu />
        </div>
        <Link href={"/"} className="flex">
          <Image
            src={"/icon/ic-logo.png"}
            width={28}
            height={20}
            alt="logo"
            className="mr-1 p-0.5"
          />
          <div className="font-bold text-[20px] text-[#2A3995]">
            JBKNEW 동문회
          </div>
        </Link>
      </div>
      <Link href={"/mypage"} className="flex items-center">
        <Image
          src={
            user?.logo_url
              ? `${user.logo_url}?t=${user.updated_at}&v=${Date.now()}`
              : "/icon/profile-empty.png"
          }
          width={100}
          height={100}
          alt="user"
          className="w-8 h-8 rounded-full object-cover border border-gray-200"
        />
      </Link>
    </div>
  );
}

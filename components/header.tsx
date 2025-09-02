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
  role?: string;
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
        .select("id, logo_url, updated_at,role")
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

  if (pathname === "/login" || pathname === "/signup") return null;

  // console.log(user);

  return (
    <div className="flex justify-between pb-3 px-3 items-center">
      <div className="flex items-center">
        <div className="mr-1">
          <Menu />
        </div>
        <Link href={"/"} className="flex items-center">
          <Image
            src={"/icon/ic-logo-simple.png"}
            width={27}
            height={20}
            alt="logo"
            className="mr-1 "
          />
          <div className="font-bold text-[18px] text-[#2A3995]">
            전북청년창업사관학교 총동문회
          </div>
        </Link>
      </div>
      <div className="flex items-center">
        {/* {user?.role === "admin" && (
          <Link
            href={"/admin/alumni"}
            className="flex items-center mr-2 rounded-full border border-gray-300 text-[#2A3995] px-3 py-1 text-[14px] font-semibold"
          >
            관리
          </Link>
        )} */}
        <Link href={"/mypage"} className="flex items-center mr-2">
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
    </div>
  );
}

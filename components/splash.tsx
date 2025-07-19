"use client";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Splash() {
  const [isShow, setIsShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  if (!isShow) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-between h-screen *:font-bold *:text-xl *:text-[#033892]  bg-white
      "
    >
      <div></div>
      <div className="flex flex-col items-center">
        <Image
          src={"/icon/ic-Logo_2.png"}
          width={150}
          height={40}
          alt="title"
          className="mb-5"
        />
        <div>전북청년창업사관학교 동문회</div>
      </div>
      <div className="mb-20">
        <Image
          src={"/icon/ic-logo-kosme.png"}
          width={120}
          height={120}
          alt="Logo"
        />
      </div>
    </div>
  );
}

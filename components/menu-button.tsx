"use client";
import Image from "next/image";
import { useState } from "react";
import MenuPanel from "./menu-panel";

export default function Menu() {
  const [isMenu, setIsMenu] = useState(false);

  return (
    <>
      <div
        onClick={() => {
          setIsMenu(true);
        }}
      >
        <Image src={"/icon/ic-menu-3.png"} width={24} height={24} alt="menu" />
      </div>
      {isMenu && <MenuPanel setIsMenu={setIsMenu} />}
    </>
  );
}

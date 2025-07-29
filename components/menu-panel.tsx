"use client";

import Image from "next/image";
import Link from "next/link";

interface MenuPanelProps {
  setIsMenu: (value: boolean) => void;
}

export default function MenuPanel({ setIsMenu }: MenuPanelProps) {
  return (
    <div className="absolute z-10 top-0 left-0 w-screen h-screen">
      <div className="bg-white w-[260px] h-screen z-20 absolute top-0 left-0 p-4">
        <div className="flex justify-between w-full items-center h-[40px] ">
          <div className="flex">
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
          </div>
          <div>
            <Image
              src={"/icon/ic-cancel.png"}
              width={20}
              height={20}
              alt="cancel"
              onClick={() => setIsMenu(false)}
            />
          </div>
        </div>
        <div>
          <div
            className="flex flex-col mt-6 gap-3 *:flex *:font-bold *:rounded-xl
         text-[18px] *:items-center *:w-full
      "
          >
            <Link
              href={"/alumni"}
              className="mb-3"
              onClick={() => setIsMenu(false)}
            >
              <Image
                src={"/icon/ic-alum.png"}
                width={25}
                height={10}
                alt="alumni"
              />
              <div className="pl-3">동문찾기</div>
            </Link>
            <Link
              href={"/notice"}
              className="mb-3"
              onClick={() => setIsMenu(false)}
            >
              <Image
                src={"/icon/ic-notice-1.png"}
                width={25}
                height={10}
                alt="alumni"
              />
              <div className="pl-3">공지사항</div>
            </Link>
            <Link
              href={"/events"}
              className=""
              onClick={() => setIsMenu(false)}
            >
              <Image
                src={"/icon/ic-events.png"}
                width={25}
                height={10}
                alt="alumni"
              />
              <div className="pl-3">행사일정</div>
            </Link>
          </div>

          <div className="w-full h-px bg-gray-200 my-6" />

          <div
            className="flex flex-col mt-6 gap-2 *:flex *:font-bold *:rounded-xl
         text-[18px] *:items-center *:w-full
      "
          >
            <Link
              href={"/admin/alumni"}
              className="mb-1"
              onClick={() => setIsMenu(false)}
            >
              <div className="pl-1">동문 관리</div>
            </Link>
            <Link
              href={"/admin/notice"}
              className="mb-1"
              onClick={() => setIsMenu(false)}
            >
              <div className="pl-1">공지사항 관리</div>
            </Link>
            <Link
              href={"/admin/events"}
              className="mb-1"
              onClick={() => setIsMenu(false)}
            >
              <div className="pl-1">행사일정 관리</div>
            </Link>
          </div>
          {/* <Link
            href={"/alumni"}
            className="mb-8"
            onClick={() => setIsMenu(false)}
          >
            동문찾기
          </Link>
          <Link
            href={"/notice"}
            className="mb-8"
            onClick={() => setIsMenu(false)}
          >
            공지사항
          </Link>
          <Link href={"/events"} className="" onClick={() => setIsMenu(false)}>
            행사일정
          </Link> */}
        </div>
      </div>
      <div
        onClick={() => setIsMenu(false)}
        className="bg-black/30 absolute z-10 top-0 left-0 w-screen h-screen"
      />
    </div>
  );
}

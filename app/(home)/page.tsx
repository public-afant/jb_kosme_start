import Image from "next/image";
import Link from "next/link";
import HomeNoticeList from "./home-notice-list";
import BannerPopup from "@/components/banner-slider";

export default function Home() {
  return (
    <div className="z-10 px-3">
      {/* 배너 팝업 */}
      <BannerPopup />

      <div className="w-full  bg-[#2A3995] rounded-2xl mt-1 p-6 flex flex-col justify-between ">
        <Image
          src={"/icon/ic-title-white.png"}
          width={100}
          height={50}
          alt="title"
        />
        <div className="font-semibold text-white text-lg mt-4">
          전북청년창업사관학교 동문 여러분의 방문을 환영합니다.
        </div>
      </div>
      <div
        className="flex mt-6 justify-between gap-3 *:flex *:flex-col *:justify-center *:items-center *:font-bold *:rounded-xl
        *:w-full *:h-[100px] text-[15px]
      "
      >
        <Link href={"/alumni"} className="">
          <Image
            src={"/icon/ic-alum.png"}
            width={40}
            height={30}
            alt="alumni"
          />
          <div className="mt-2">동문찾기</div>
        </Link>
        <Link href={"/notice"} className="">
          <Image
            src={"/icon/ic-notice-1.png"}
            width={40}
            height={30}
            alt="alumni"
          />
          <div className="mt-2">공지사항</div>
        </Link>
        <Link href={"/events"} className="">
          <Image
            src={"/icon/ic-events.png"}
            width={45}
            height={30}
            alt="alumni"
          />
          <div className="mt-2">행사일정</div>
        </Link>
      </div>
      <div>
        <div className="font-bold text-[22px] mt-5">
          <span className="text-[#2A3995]">공지</span>사항
        </div>
        <HomeNoticeList />
      </div>
    </div>
  );
}

import NoticeList from "../(home)/notice-list";

export default function Notice() {
  return (
    <div className="max-w-4xl mx-auto px-3">
      <div className="mb-6">
        <div className="font-bold text-[22px] mb-2">
          <span className="text-[#2A3995]">공지</span>사항
        </div>
        <div className="text-gray-600 text-sm">
          동문회의 주요 소식과 안내사항을 확인하세요.
        </div>
      </div>
      <NoticeList />
    </div>
  );
}

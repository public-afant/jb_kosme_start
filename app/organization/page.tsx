import Image from "next/image";

export default function Organization() {
  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2A3995] mb-2">임원 조직도</h1>
        <p className="text-gray-600">
          전북청년창업사관학교 총동문회 임원진 조직 구조를 확인하실 수 있습니다.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex flex-col items-center space-y-6">
          {/* ic-logo-simple.png 가운데 배치 */}

          {/* organization 폴더의 1.png부터 13.png까지 순서대로 표시 */}
          {Array.from({ length: 13 }, (_, i) => i + 1).map((num) => (
            <Image
              key={num}
              src={`/organization/${num}.png`}
              width={500}
              height={300}
              alt={`organization ${num}`}
              className="w-[350px] mb-5"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

import Image from "next/image";

export type AlumniUser = {
  id: string;
  name: string;
  class_of: number;
  company_name: string;
  phone_number: string;
  logo_url: string | null;
  item: string[];
  email: string;
};

type Props = {
  user: AlumniUser;
  onClose: () => void;
};

export default function AlumniCardModal({ user, onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl px-4 pt-10 pb-6 min-w-[220px] max-w-[220px] flex flex-col items-center relative"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={user.logo_url || "/icon/profile-empty.png"}
          alt="logo"
          width={200}
          height={200}
          className="w-25 h-25 object-cover aspect-square bg-white border-1 border-gray-200 rounded-full mb-5"
        />
        {Array.isArray(user.item) && user.item.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5 justify-center">
            {user.item.map((tag: string, idx: number) => (
              <span
                key={idx}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col items-end w-full mt-10">
          <div className="font-bold text-xl">
            {user.name}{" "}
            <span className="text-base text-gray-500">({user.class_of}기)</span>
          </div>
          <div className="text-gray-700 font-semibold text-[16px] ">
            {user.company_name}
          </div>
          <div className="text-gray-500 text-sm mb-2">{user.email}</div>
        </div>
        {/* <div className="text-gray-500 text-sm">{user.phone_number}</div> */}
        {/* 태그 렌더링 */}
      </div>
    </div>
  );
}

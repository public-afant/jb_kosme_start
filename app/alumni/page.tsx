"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";
import AlumniCardModal, { AlumniUser } from "@/components/alumni-card-modal";

const supabase = createClient();
const PAGE_SIZE = 20;

type User = {
  id: string;
  name: string;
  class_of: number;
  company_name: string;
  phone_number: string;
  logo_url: string | null;
  item: string[];
  email: string | null;
};

export default function Alumni() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);
  const lastUserRef = useRef<HTMLLIElement | null>(null);
  const [selectedUser, setSelectedUser] = useState<AlumniUser | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // 검색어
  const [selectedClass, setSelectedClass] = useState<number | "all">("all"); // 선택된 기수
  const [availableClasses, setAvailableClasses] = useState<number[]>([]); // 사용 가능한 기수들

  // 사용 가능한 기수들 불러오기
  const fetchAvailableClasses = useCallback(async () => {
    const { data, error } = await supabase
      .from("user_with_email")
      .select("class_of")
      .eq("role", "user")
      .order("class_of", { ascending: true });

    if (!error && data) {
      const classes = [...new Set(data.map((user) => user.class_of))].sort(
        (a, b) => a - b
      );
      setAvailableClasses(classes);
    }
  }, []);

  // 데이터 불러오기 (검색어와 기수 필터 적용)
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from("user_with_email")
      .select(
        "id, name, class_of, company_name, phone_number, logo_url, item, email"
      )
      .eq("role", "user")
      .order("class_of", { ascending: true })
      .order("id", { ascending: true });

    // 기수 필터링
    if (selectedClass !== "all") {
      query = query.eq("class_of", selectedClass);
    }

    // 검색어 필터링
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      query = query.or(`name.ilike.%${term}%,company_name.ilike.%${term}%`);
    }

    const { data, error } = await query.range(from, to);

    if (!error) {
      if (page === 0) {
        // 첫 페이지면 기존 데이터 교체
        setUsers(data as User[]);
      } else {
        // 다음 페이지면 기존 데이터에 추가
        setUsers((prev) => {
          const prevIds = new Set(prev.map((u) => u.id));
          const newUsers = ((data as User[]) || []).filter(
            (u) => !prevIds.has(u.id)
          );
          return [...prev, ...newUsers];
        });
      }
      setHasMore((data?.length || 0) === PAGE_SIZE);
    }
    setLoading(false);
  }, [page, searchTerm, selectedClass]);

  // 초기 기수 목록 불러오기
  useEffect(() => {
    fetchAvailableClasses();
  }, [fetchAvailableClasses]);

  // 검색어나 기수가 변경되면 페이지 리셋하고 데이터 다시 불러오기
  useEffect(() => {
    setPage(0);
    setUsers([]);
    setHasMore(true);
  }, [searchTerm, selectedClass]);

  // 데이터 불러오기 (페이지 변경 또는 필터 변경 시)
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Intersection Observer로 무한 스크롤 감지
  useEffect(() => {
    if (!hasMore || loading) return;
    if (observer.current) observer.current.disconnect();

    observer.current = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    });

    if (lastUserRef.current) {
      observer.current.observe(lastUserRef.current);
    }
  }, [hasMore, loading, users]);

  return (
    <div>
      {/* 검색 및 필터 섹션 */}
      <div className="my-1 px-3">
        <div className="flex flex-col sm:flex-row gap-2">
          {/* 기수 선택 */}
          <div className="">
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(
                  e.target.value === "all" ? "all" : Number(e.target.value)
                )
              }
              className="w-full h-10 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 기수</option>
              {availableClasses.map((classNum) => (
                <option key={classNum} value={classNum}>
                  {classNum}기
                </option>
              ))}
            </select>
          </div>
          {/* 검색창 */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="이름 또는 회사명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <ul>
        {users.map((user, idx) => (
          <li
            key={user.id}
            className="p-2 flex items-center gap-4 border-b border-gray-200 last:border-b-0 cursor-pointer"
            ref={idx === users.length - 1 ? lastUserRef : undefined}
            onClick={() =>
              setSelectedUser({
                ...user,
                email: user.email || "",
              })
            }
          >
            <Image
              src={user.logo_url || "/icon/profile-empty.png"}
              alt="logo"
              width={100}
              height={100}
              className="w-14 h-14 object-contain bg-white border-1 border-gray-200 rounded-full"
            />
            <div>
              <div className="font-bold text-[16px]">
                {user.name} ({user.class_of}기)
              </div>
              <div className="text-gray-700 font-semibold">
                {user.company_name}
              </div>
            </div>
          </li>
        ))}
      </ul>
      {loading && <div className="text-center py-4">로딩 중...</div>}
      {!loading && users.length === 0 && (
        <div className="text-center py-4 text-gray-400">
          {searchTerm || selectedClass !== "all"
            ? "검색 결과가 없습니다."
            : "동문 정보를 불러오는 중입니다."}
        </div>
      )}
      {!hasMore && users.length > 0 && (
        <div className="text-center py-4 text-gray-400">
          모든 동문을 불러왔습니다.
        </div>
      )}

      {/* 명함 모달 */}
      {selectedUser && (
        <AlumniCardModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

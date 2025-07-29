"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Image from "next/image";

const supabase = createClient();

type Event = {
  id: string;
  fk_user_id: string;
  title: string;
  content: string;
  date: string;
  time: string;
  state: boolean;
  created_at: string;
  updated_at: string;
};

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // 현재 날짜로 시작
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("state", true)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching events:", error);
        setError("행사 데이터를 불러오는 중 오류가 발생했습니다.");
        return;
      }

      // console.log("Fetched events:", data); // 디버깅용
      setEvents(data || []);

      // 추가 디버깅: 각 이벤트의 날짜 확인
      // if (data && data.length > 0) {
      //   console.log("Event dates in database:");
      //   data.forEach(event => {
      //     console.log(`- ${event.title}: ${event.date}`);
      //   });
      // }
    } catch (error) {
      console.error("Error:", error);
      setError("행사 데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 캘린더 관련 함수들
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    // 한국 시간대로 YYYY-MM-DD 형식 반환
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatTime = (timeString: string) => {
    // "09:00:00+00" 형태를 "09:00"으로 변환
    if (timeString) {
      return timeString.split(":").slice(0, 2).join(":");
    }
    return timeString;
  };

  const hasEventOnDate = (date: string) => {
    const hasEvent = events.some((event) => {
      // ISO 형식 날짜를 YYYY-MM-DD 형식으로 변환
      const eventDateOnly = event.date.split("T")[0];
      return eventDateOnly === date;
    });
    return hasEvent;
  };

  const getEventsForMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    // console.log("Current date:", currentDate);
    // console.log("Looking for year:", year, "month:", month);
    // console.log("All events:", events);

    const filteredEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      const eventYear = eventDate.getFullYear();
      const eventMonth = eventDate.getMonth() + 1;

      // console.log(
      //   "Event:",
      //   event.title,
      //   "Date:",
      //   event.date,
      //   "Parsed:",
      //   eventDate,
      //   "Year:",
      //   eventYear,
      //   "Month:",
      //   eventMonth
      // );

      const matches = eventYear === year && eventMonth === month;
      // console.log("Matches current month:", matches);

      return matches;
    });

    // console.log("Filtered events for current month:", filteredEvents);
    return filteredEvents;
  };

  const monthNames = [
    "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월",
  ];

  const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // 이전 달의 마지막 날들
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // 현재 달의 날들
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(
        new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      );
      const hasEvent = hasEventOnDate(dateStr);

      // console.log(`Day ${day}, Date: ${dateStr}, HasEvent: ${hasEvent}`);

      days.push(
        <div
          key={day}
          className="h-10 flex flex-col items-center justify-center text-sm cursor-pointer hover:bg-gray-50 rounded"
        >
          <span>{day}</span>
          <div className="h-2 mt-0.5 flex items-center justify-center">
            {hasEvent && (
              <span className="w-1 h-1 bg-red-500 rounded-full"></span>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">행사 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            <span className="text-[#2A3995]">행사</span>일정
          </h1>
          <p className="text-gray-600">
            동문회의 다양한 행사 일정을 확인하세요.
          </p>
          {events.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              총 {events.length}개의 행사가 등록되어 있습니다.
            </p>
          )}
        </div>

        {/* 캘린더 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-sm font-medium text-gray-500"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 캘린더 그리드 */}
          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>

        {/* 행사 리스트 */}
        <div className="">
          {/* <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}{" "}
            일정 ({getEventsForMonth().length}개)
          </h3> */}

          {getEventsForMonth().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p>이번 달 예정된 행사가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getEventsForMonth().map((event) => {
                const eventDate = new Date(event.date);
                const dayName = dayNames[eventDate.getDay()];

                return (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                            {eventDate.getDate()}일 ({dayName})
                          </div>
                          <div className="text-gray-500 text-sm">
                            {formatTime(event.time)}
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {event.title}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {event.content}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

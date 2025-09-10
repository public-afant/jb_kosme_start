"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export default function Test() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleBulkUserRegistration = async () => {
    setLoading(true);
    setMessage("사용자 등록을 시작합니다...");

    try {
      const response = await fetch("/api/test-users?file=user-3");
      if (!response.ok) {
        throw new Error(`Failed to fetch test users: ${response.status}`);
      }
      const users = await response.json();

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < users.length; i++) {
        const user = users[i];

        try {
          // Auth 사용자 생성
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: user.email,
              password: "123456",
              email_confirm: true,
              user_metadata: {
                display_name: user.name,
                phone: user.phone_number,
              },
            });

          if (authError) {
            console.error(`Auth error for ${user.email}:`, authError);
            errorCount++;
            continue;
          }

          // users 테이블에 데이터 삽입
          const { error: insertError } = await supabase.from("users").insert({
            id: authData.user.id,
            name: user.name,
            class_of: user.class_of,
            company_name: user.company_name,
            phone_number: user.phone_number,
            logo_url: user.logo_url,
            item: user.item,
            role: user.role,
            state: true,
          });

          if (insertError) {
            console.error(`Insert error for ${user.email}:`, insertError);
            errorCount++;
          } else {
            successCount++;
          }

          // Rate limit 방지를 위한 딜레이
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing ${user.email}:`, error);
          errorCount++;
        }
      }

      setMessage(`완료! 성공: ${successCount}명, 실패: ${errorCount}명`);
    } catch (error) {
      console.error("Error:", error);
      setMessage("오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNotice = async () => {
    setLoading(true);
    setMessage("공지사항을 생성합니다...");

    try {
      // 첫 번째 사용자를 찾기
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .limit(1)
        .single();

      if (userError || !userData) {
        setMessage("사용자를 찾을 수 없습니다. 먼저 사용자를 등록해주세요.");
        setLoading(false);
        return;
      }

      const userId = userData.id;

      const notices = [
        {
          title: "[공지사항] 동문회 앱을 배포하였습니다.",
          content: `2025년 8월, 전북청년창업사관학교의 새로운 동문회 앱을 개발하게 되었습니다.

주요 기능:
• 동문 검색 및 연락처 확인
• 공지사항 및 행사 정보
• 개인정보 관리

앱을 통해 더욱 편리하게 동문들과 소통하실 수 있습니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "2025 청창사 안내사항",
          content: `동문회 사이트를 사용하기 위해서는 개인정보 수정을 필수로 해야합니다.

필수 입력 항목:
• 이름
• 연락처
• 회사명
• 프로필 이미지

개인정보를 업데이트하지 않으시면 일부 기능 사용에 제한이 있을 수 있습니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "청창사/네이버클라우드 확인 안내",
          content: `청년창업사관학교, 네이버클라우드를 필수로 확인하셔야 합니다.

확인 사항:
• 청창사 수료증
• 네이버클라우드 자격증
• 기타 관련 자격증

자격증 정보가 누락된 경우 관리자에게 문의해 주세요.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[행사안내] 2025년 동문회 정기총회",
          content: `2025년 동문회 정기총회를 개최합니다.

일시: 2025년 9월 15일 (토) 오후 2시
장소: 전북청년창업사관학교 대강당
참석대상: 전체 동문

주요 안건:
• 2024년 동문회 활동 보고
• 2025년 동문회 활동 계획
• 동문회 임원 선출
• 기타 안건

많은 참석 부탁드립니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[채용정보] 네이버클라우드 신입 개발자 채용",
          content: `네이버클라우드에서 신입 개발자를 채용합니다.

모집분야: 클라우드 개발자
모집인원: 5명
지원자격: 청창사 수료생 우대
근무지: 서울 강남구
급여: 연봉 3,500만원 ~ 4,500만원

지원방법: 네이버클라우드 채용 페이지에서 지원
지원기간: 2025년 8월 1일 ~ 8월 31일

관심 있는 동문들의 많은 지원 부탁드립니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[교육안내] AWS 클라우드 아키텍트 과정",
          content: `AWS 클라우드 아키텍트 과정을 개설합니다.

과정명: AWS Solutions Architect Associate
기간: 2025년 9월 1일 ~ 10월 31일 (2개월)
수강료: 동문 할인가 50만원 (정가 80만원)
정원: 20명 (선착순)

교육내용:
• AWS 기본 서비스 이해
• 클라우드 아키텍처 설계
• 보안 및 비용 최적화
• 실습 및 프로젝트

신청방법: 동문회 사이트에서 신청
신청기간: 2025년 8월 15일까지`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[업데이트] 동문회 사이트 개선사항",
          content: `동문회 사이트가 개선되었습니다.

주요 개선사항:
• 모바일 반응형 디자인 적용
• 동문 검색 기능 강화
• 공지사항 알림 기능 추가
• 개인정보 수정 기능 개선
• 보안 강화

새로운 기능들을 활용해 주시고, 
불편사항이나 개선요청사항이 있으시면 언제든 문의해 주세요.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[네트워킹] 동문 간 사업 협력 모임",
          content: `동문 간 사업 협력을 위한 네트워킹 모임을 개최합니다.

일시: 2025년 9월 20일 (목) 오후 7시
장소: 전주 시내 레스토랑
참석대상: 창업 중이거나 창업을 준비 중인 동문
참석비: 3만원 (식사 포함)

프로그램:
• 동문 사업 소개 및 발표
• 네트워킹 타임
• 협력 가능성 논의

사업 협력이나 정보 교환에 관심 있는 동문들의 참석을 환영합니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[자격증] 정보처리기사 시험 안내",
          content: `2025년 하반기 정보처리기사 시험 안내입니다.

시험일: 2025년 10월 12일 (일)
접수기간: 2025년 8월 20일 ~ 9월 10일
시험장소: 전주시 내 지정 시험장
응시료: 18,000원

동문회에서 시험 준비를 위한 스터디 그룹을 운영합니다.
참여 희망자는 동문회 사이트에서 신청해 주세요.

자격증 취득을 통해 경력 개발에 도움이 되시기 바랍니다.`,
          fk_user_id: userId,
          state: true,
        },
        {
          title: "[알림] 동문회비 납부 안내",
          content: `2025년 동문회비 납부를 안내드립니다.

납부금액: 연회비 5만원
납부기간: 2025년 1월 1일 ~ 12월 31일
납부방법: 
• 온라인 납부: 동문회 사이트에서 카드 결제
• 계좌이체: 농협 123-456789-01-234 (동문회)

동문회비는 다음과 같은 활동에 사용됩니다:
• 동문회 운영비
• 행사 개최비
• 교육 프로그램 지원
• 동문 간 네트워킹 활동

많은 동문들의 참여 부탁드립니다.`,
          fk_user_id: userId,
          state: true,
        },
      ];

      let successCount = 0;
      let errorCount = 0;

      for (const notice of notices) {
        try {
          const { error } = await supabase.from("notice").insert(notice);

          if (error) {
            console.error("Notice insert error:", error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error("Error creating notice:", error);
          errorCount++;
        }
      }

      setMessage(
        `공지사항 생성 완료! 성공: ${successCount}개, 실패: ${errorCount}개`
      );
    } catch (error) {
      console.error("Error:", error);
      setMessage("공지사항 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">테스트 페이지</h1>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">사용자 등록</h2>
          <p className="text-gray-600 mb-4">
            JSON 파일에서 사용자 데이터를 읽어와 Auth와 users 테이블에
            등록합니다.
          </p>
          <button
            onClick={handleBulkUserRegistration}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? "처리 중..." : "사용자 등록 시작"}
          </button>
        </div>

        <div className="p-4 border border-gray-200 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">공지사항 생성</h2>
          <p className="text-gray-600 mb-4">샘플 공지사항을 생성합니다.</p>
          <button
            onClick={handleCreateNotice}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            {loading ? "처리 중..." : "공지사항 생성"}
          </button>
        </div>

        {message && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-800">{message}</p>
          </div>
        )}
      </div>
    </div>
  );
}

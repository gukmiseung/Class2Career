begin;

-- Fill gaps in the course-based career catalog without changing existing links.
with links (course_code, career_slug, concepts) as (
  values
    ('CAIB0216', 'ai-engineer', '보상 설계와 정책 학습'),
    ('CAIB0222', 'ai-engineer', 'AI 모델 학습과 시스템 통합'),
    ('CAIB0222', 'systems-architect', '모델과 서비스 구성 요소의 연동'),
    ('CAIB0223', 'ai-engineer', '데이터 전처리와 AI 모델 구현·평가'),
    ('CAIB0224', 'data-scientist', '엔트로피와 상호 정보량을 이용한 변수 분석'),
    ('CAIB0224', 'network-engineer', '채널 용량과 전송 오류 정정'),
    ('CAIB0225', 'nlp-engineer', '음성에서 텍스트로 변환하는 모델 학습과 평가'),
    ('CLTR0211', 'ai-engineer', '변화율과 미분 기반 모델 최적화'),
    ('CLTR0213', 'game-programmer', '운동과 충돌을 표현하는 물리 모델링'),
    ('CLTR0213', 'embedded-software-developer', '전기·자기와 센서 측정의 기초'),
    ('CLTR0246', 'data-scientist', '생명과학 실험 데이터 해석과 가설 검증'),
    ('CLTR0819', 'data-scientist', '벡터·행렬과 확률 기반 데이터 모델링'),
    ('COME0427', 'database-developer', '관계형 모델과 SQL, 데이터 무결성'),
    ('COME0427', 'data-engineer', '스키마 설계와 데이터 추출'),
    ('COMP0204', 'backend-developer', '기본 제어 흐름과 함수로 서비스 로직 구현'),
    ('COMP0205', 'ui-ux-designer', '사용자 요구 분석과 프로토타입 검증'),
    ('COMP0205', 'systems-architect', '설계 요구사항 정의와 대안 비교'),
    ('COMP0206', 'backend-developer', '함수 분해와 모듈 단위 프로그램 구현'),
    ('COMP0207', 'backend-developer', '코드 작성, 실행 결과 확인과 디버깅'),
    ('COMP0216', 'backend-developer', '자료구조 선택과 서비스 데이터 처리'),
    ('COMP0216', 'game-programmer', '게임 상태를 표현하는 자료구조와 탐색'),
    ('COMP0218', 'ai-engineer', 'AI 모델과 컴퓨팅의 기초'),
    ('COMP0219', 'ai-engineer', '확률·선형대수·최적화로 모델 학습 분석'),
    ('COMP0220', 'ai-engineer', '모델 구조와 실험 결과의 기술 문서화'),
    ('COMP0226', 'systems-software-developer', '계산 모델과 양자 회로 시뮬레이션의 기초'),
    ('COMP0315', 'systems-software-developer', '형식 문법과 컴파일러 구문 분석'),
    ('COMP0320', 'backend-developer', '고급 알고리즘과 복잡도 기반 성능 개선'),
    ('COMP0320', 'game-programmer', '경로 탐색과 계산 성능 최적화'),
    ('COMP0332', 'backend-developer', '요구사항을 코드로 구현하고 입력·출력 검증'),
    ('COMP0334', 'backend-developer', '프로그램 구성과 기능 단위 디버깅'),
    ('COMP0335', 'backend-developer', '트리·그래프 등 자료구조 구현과 성능 검증'),
    ('COMP0336', 'mobile-app-developer', '클래스·객체·인터페이스를 활용한 앱 구조 설계'),
    ('COMP0336', 'backend-developer', '객체지향 모델로 서비스 책임 분리'),
    ('COMP0337', 'backend-developer', '모듈화와 테스트를 이용한 기능 구현'),
    ('COMP0338', 'backend-developer', '복합 기능 구현과 코드 품질 개선'),
    ('COMP0339', 'ai-engineer', 'AI 모델을 서비스 코드와 연결하는 프로그래밍 실습'),
    ('COMP0342', 'ai-engineer', 'AI 응용 모델 비교와 실험 재현'),
    ('COMP0342', 'data-scientist', 'AI 응용의 평가지표 설계와 결과 검증'),
    ('COMP0343', 'systems-architect', '융합 시스템의 구성 요소 비교와 통합 검토'),
    ('COMP0344', 'systems-architect', '신규 컴퓨팅 플랫폼의 성능과 도입 조건 평가'),
    ('COMP0423', 'systems-software-developer', '프로그래밍 언어의 타입·실행 의미와 구현'),
    ('COMP0428', 'systems-architect', '조직 요구에 맞춘 시스템 도입과 투자 효과 평가'),
    ('COMP0428', 'web-service-planner', 'IT 서비스 목표와 프로젝트 우선순위 설정'),
    ('COMP0432', 'systems-architect', '소프트웨어 아키텍처 대안과 적용 조건 비교'),
    ('COMP0453', 'backend-developer', '문제 분해와 절차 설계를 실제 코드로 구현'),
    ('COMP0454', 'ai-engineer', '모델의 입력과 가중치를 다루는 수학 기초'),
    ('COMP0457', 'ai-engineer', '의료 데이터 기반 예측 모델 개발과 평가'),
    ('COMP0457', 'data-scientist', '의료 데이터의 편향과 예측 성능 검증'),
    ('COMP0458', 'network-engineer', '모바일 통신망과 네트워크 성능 분석'),
    ('COMP0460', 'qa-engineer', '요구사항 기반 테스트와 정상·경계·오류 입력 검증'),
    ('COMP0461', 'systems-architect', '복합 요구사항의 모델링과 시스템 통합'),
    ('COMP0510', 'systems-software-developer', '프로세서 구조와 메모리 계층 성능 분석'),
    ('EECS0442', 'embedded-software-developer', '하드웨어 제약을 고려한 펌웨어와 입출력 설계'),
    ('EECS0442', 'iot-developer', '센서와 임베디드 기기 제어'),
    ('ELEC0247', 'embedded-software-developer', '조합·순서 회로와 디지털 제어'),
    ('GLSO0212', 'systems-software-developer', '논리·집합·그래프를 이용한 소프트웨어 모델링'),
    ('GLSO0213', 'ui-ux-designer', '문제 정의와 시제품 기반 사용자 검증'),
    ('GLSO0213', 'systems-architect', '융합 설계의 요구사항 정리와 구성 요소 통합'),
    ('GLSO0214', 'backend-developer', '서비스 개발 직무의 요구 역량과 포트폴리오 탐색'),
    ('GLSO0214', 'data-analyst', '데이터 직무의 역할과 프로젝트 포트폴리오 탐색'),
    ('GLSO0214', 'web-service-planner', '서비스 기획 직무의 요구 역량과 학습 계획 탐색'),
    ('GLSO0215', 'backend-developer', '오픈소스 라이브러리 활용과 협업 개발'),
    ('GLSO0215', 'devops-engineer', '공유 저장소의 버전 관리와 빌드·테스트 흐름'),
    ('GLSO0216', 'backend-developer', '알고리즘 구현과 시간·공간 복잡도 평가'),
    ('GLSO0223', 'web-service-planner', '사용자 문제와 서비스 가설 검증, 출시 우선순위'),
    ('GLSO0229', 'web-service-planner', 'MVP 범위 결정과 사용자 피드백을 반영한 개선'),
    ('GLSO0229', 'backend-developer', '서비스 프로토타입의 기능 구현과 통합'),
    ('ITEC0201', 'systems-architect', '하드웨어·소프트웨어·네트워크의 구성 이해'),
    ('ITEC0401', 'systems-architect', '사용자 요구사항을 시스템 구조로 설계'),
    ('ITEC0402', 'systems-architect', '시스템 통합, 성능 검토와 기술 문서화'),
    ('ITEC0402', 'qa-engineer', '팀 프로젝트의 요구사항 기반 시험과 품질 검증'),
    ('ITEC0403', 'web-service-planner', '콘텐츠·소프트웨어 권리와 서비스 출시 조건 검토'),
    ('ITEC0415', 'backend-developer', '복합 문제 모델링과 효율적인 해결 절차 구현'),
    ('ITEC0514', 'ui-ux-designer', '사용자의 지각과 인지 부하를 고려한 인터랙션 설계'),
    ('MBIO0402', 'data-scientist', '생물학 데이터의 패턴 탐색과 통계적 검증'),
    ('MBIO0402', 'data-engineer', '서열·참조 데이터의 구조화와 처리'),
    ('STAT0452', 'data-scientist', '숫자 근사와 수치 오차를 고려한 계산 모델 검증'),
    ('STAT0452', 'ai-engineer', '수치 최적화와 계산 오차를 고려한 모델 구현')
),
new_links as (
  select distinct c.id as course_id, links.course_code, links.career_slug, links.concepts
  from links
  join public.c2c_courses c on c.course_code = links.course_code
  where exists (
    select 1
    from public.c2c_curriculum_courses cc
    where cc.course_id = c.id
      and coalesce(cc.requirement_label, cc.course_category, '미분류')
        not in ('교양', '교직', '기본소양', '일반선택')
  )
  and not exists (
    select 1
    from public.c2c_career_courses existing
    where existing.career_slug = links.career_slug and existing.course_id = c.id
  )
),
current_order as (
  select career_slug, max(sort_order) as last_position
  from public.c2c_career_courses
  group by career_slug
)
insert into public.c2c_career_courses (career_slug, course_id, sort_order, concepts)
select new_links.career_slug, new_links.course_id,
  coalesce(current_order.last_position, 0)
    + row_number() over (partition by new_links.career_slug order by new_links.course_code, new_links.course_id),
  new_links.concepts
from new_links
left join current_order using (career_slug)
on conflict (career_slug, course_id) do nothing;

commit;

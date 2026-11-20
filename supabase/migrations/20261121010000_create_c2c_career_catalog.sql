begin;

create table if not exists public.c2c_careers (
  slug text primary key check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null unique,
  category text not null check (category in ('개발', '데이터·AI', '디자인·기획', '인프라', '보안')),
  description text not null,
  keywords text[] not null default '{}',
  sort_order integer not null check (sort_order > 0)
);

create table if not exists public.c2c_career_sources (
  career_slug text not null references public.c2c_careers (slug) on delete cascade,
  publisher text not null,
  title text not null,
  url text not null check (url like 'https://%'),
  primary key (career_slug, url)
);

create table if not exists public.c2c_career_courses (
  career_slug text not null references public.c2c_careers (slug) on delete cascade,
  course_id bigint not null references public.c2c_courses (id),
  concepts text not null,
  sort_order integer not null check (sort_order > 0),
  primary key (career_slug, course_id)
);

create index if not exists c2c_career_courses_course_id_idx
  on public.c2c_career_courses (course_id);

-- The catalog contains public career information. Writes are reserved for administrative roles.
do $$
declare
  catalog_table text;
begin
  foreach catalog_table in array array['c2c_careers', 'c2c_career_sources', 'c2c_career_courses']
  loop
    execute format('alter table public.%I enable row level security', catalog_table);
    execute format('revoke all on public.%I from public, anon, authenticated', catalog_table);
    execute format('grant select on public.%I to anon, authenticated', catalog_table);
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = catalog_table and policyname = 'Read career catalog'
    ) then
      execute format(
        'create policy "Read career catalog" on public.%I for select to anon, authenticated using (true)',
        catalog_table
      );
    end if;
  end loop;
end $$;

insert into public.c2c_careers (slug, title, category, description, keywords, sort_order) values
  ('frontend-developer', '프론트엔드 개발자', '개발', '웹 화면과 인터랙션을 구현하고 다양한 기기에서 접근성과 성능을 개선해요.', array['Frontend', 'JavaScript', '웹 개발'], 1),
  ('backend-developer', '백엔드 개발자', '개발', '서비스의 API와 비즈니스 로직을 구현하고 데이터베이스와 서버를 연결해요.', array['Backend', '서버', 'API'], 2),
  ('ai-engineer', 'AI 엔지니어', '데이터·AI', '문제에 맞는 인공지능 모델을 학습·평가하고 서비스에 배포해 개선해요.', array['인공지능', '머신러닝', 'ML Engineer'], 3),
  ('data-analyst', '데이터 분석가', '데이터·AI', '서비스 지표를 정의하고 데이터를 분석해 의사결정에 필요한 결과를 시각화해요.', array['Data Analyst', 'BI', 'SQL'], 4),
  ('ui-ux-designer', 'UI/UX 디자이너', '디자인·기획', '사용자 행동을 조사하고 화면과 인터랙션을 설계한 뒤 프로토타입으로 사용성을 확인해요.', array['UX Design', '사용자 경험', '프로토타입'], 5),
  ('cloud-engineer', '클라우드 엔지니어', '인프라', '클라우드의 서버·스토리지·네트워크를 구성하고 가용성과 운영 비용을 관리해요.', array['Cloud', '가상화', '클라우드 시스템'], 6),
  ('mobile-app-developer', '모바일 앱 개발자', '개발', 'Android와 iOS 앱의 기능을 만들고 기기별 동작과 앱 성능을 개선해요.', array['Android', 'iOS', 'Mobile'], 7),
  ('game-programmer', '게임 프로그래머', '개발', '게임 엔진으로 조작, 충돌, 렌더링과 같은 기능을 구현하고 실행 성능을 최적화해요.', array['게임 개발자', '게임 클라이언트', 'Unity', 'Unreal'], 8),
  ('systems-software-developer', '시스템 소프트웨어 개발자', '개발', '운영체제, 컴파일러, 시스템 라이브러리처럼 다른 프로그램이 실행되는 기반을 개발해요.', array['시스템 프로그래머', '커널', '컴파일러'], 9),
  ('embedded-software-developer', '임베디드 소프트웨어 개발자', '개발', '기기 내부의 펌웨어를 개발하고 제한된 메모리와 전력으로 센서와 장치를 제어해요.', array['Embedded', '펌웨어', '마이크로컨트롤러'], 10),
  ('iot-developer', '사물인터넷 개발자', '개발', '센서와 기기를 네트워크에 연결하고, 수집한 데이터를 서버나 앱에서 활용할 수 있게 만들어요.', array['IoT', '센서', '스마트 기기'], 11),
  ('qa-engineer', '소프트웨어 QA 엔지니어', '개발', '요구사항을 바탕으로 테스트를 설계하고 오류를 재현·기록하며 반복 검증을 자동화해요.', array['QA', '품질 보증', '테스트 자동화'], 12),
  ('xr-developer', 'XR 개발자', '개발', '3D 그래픽과 공간 추적을 이용해 가상현실·증강현실 콘텐츠와 상호작용을 구현해요.', array['AR', 'VR', '가상현실', '증강현실'], 13),
  ('blockchain-developer', '블록체인 개발자', '개발', '여러 참여자가 거래 기록을 검증하고 공유할 수 있도록 분산원장 기반의 프로그램을 개발해요.', array['Blockchain', '분산원장', '스마트 계약'], 14),
  ('data-engineer', '데이터 엔지니어', '데이터·AI', '여러 시스템의 데이터를 수집·변환하는 파이프라인을 만들고 데이터 품질을 관리해요.', array['Data Engineer', 'ETL', '데이터 파이프라인'], 15),
  ('data-scientist', '데이터 사이언티스트', '데이터·AI', '통계와 머신러닝으로 데이터에서 패턴을 찾고 예측 모델을 만들어 가설을 검증해요.', array['Data Scientist', '통계', '예측 모델'], 16),
  ('database-developer', '데이터베이스 개발자', '데이터·AI', '서비스 요구에 맞춰 테이블과 관계를 설계하고 데이터 처리 쿼리의 성능을 개선해요.', array['DB', 'SQL', '데이터 모델링'], 17),
  ('nlp-engineer', '자연어 처리 엔지니어', '데이터·AI', '검색, 요약, 대화처럼 문장을 이해하거나 생성하는 모델을 개발하고 결과의 품질을 평가해요.', array['NLP', 'LLM', '언어 모델'], 18),
  ('computer-vision-engineer', '컴퓨터 비전 엔지니어', '데이터·AI', '이미지와 영상에서 객체나 패턴을 인식하는 모델을 개발하고 실제 환경에서 정확도를 검증해요.', array['Computer Vision', '영상 인식', '객체 탐지'], 19),
  ('game-designer', '게임 기획자', '디자인·기획', '게임의 규칙과 보상, 레벨을 설계하고 플레이 테스트를 통해 난이도와 진행 흐름을 조정해요.', array['Game Designer', '레벨 디자인', '밸런스'], 20),
  ('web-service-planner', '웹 서비스 기획자', '디자인·기획', '사용자와 운영 조직의 요구를 정리하고 서비스 화면 흐름, 기능 명세, 출시 우선순위를 정해요.', array['웹 기획자', '웹 프로듀서', '요구사항'], 21),
  ('network-engineer', '네트워크 엔지니어', '인프라', '네트워크 구성을 설계하고 트래픽과 연결 상태를 점검해 안정적인 통신을 유지해요.', array['Network', '라우팅', '컴퓨터망'], 22),
  ('systems-architect', '컴퓨터시스템 설계·분석가', '인프라', '업무 요구사항을 분석해 시스템 구성과 연동 방식을 설계하고 도입 전 성능과 호환성을 검토해요.', array['시스템 아키텍트', 'SI', '시스템 분석'], 23),
  ('devops-engineer', 'DevOps 엔지니어', '인프라', '빌드·테스트·배포를 자동화하고 서비스 상태를 관측해 개발팀이 안정적으로 변경을 배포하도록 도와요.', array['데브옵스', 'CI/CD', '컨테이너'], 24),
  ('systems-administrator', '정보시스템 운영자', '인프라', '서버와 운영체제를 관리하고 장애 대응, 업데이트, 백업과 복구를 수행해요.', array['시스템 관리자', 'Linux', '서버 운영'], 25),
  ('security-analyst', '정보보안 분석가', '보안', '시스템과 네트워크의 로그를 관찰하고 이상 징후를 분석해 보안 사고 대응을 지원해요.', array['보안 관제', 'SOC', '침해 사고 대응'], 26),
  ('security-engineer', '보안 엔지니어', '보안', '서비스와 인프라의 접근 제어, 암호화, 보안 점검을 설계하고 보호 장치를 운영해요.', array['정보보호 전문가', 'Security Engineer', '접근 제어'], 27),
  ('digital-forensics-analyst', '디지털 포렌식 분석가', '보안', '디지털 증거를 보존하고 저장 장치와 로그의 기록을 분석해 사건의 경위를 정리해요.', array['디지털 증거', 'Digital Forensics', '로그 분석'], 28)
on conflict (slug) do nothing;

-- Source titles identify the reference occupation, including broader classifications for specializations.
insert into public.c2c_career_sources (career_slug, publisher, title, url) values
  ('frontend-developer', 'O*NET Online', 'Web Developers', 'https://www.onetonline.org/link/summary/15-1254.00'),
  ('backend-developer', 'O*NET Online', 'Web Developers', 'https://www.onetonline.org/link/summary/15-1254.00'),
  ('backend-developer', 'O*NET Online', 'Software Developers', 'https://www.onetonline.org/link/summary/15-1252.00'),
  ('ai-engineer', '커리어넷', '인공지능 엔지니어', 'https://www.career.go.kr/cloud/m/job/view?seq=10117'),
  ('data-analyst', 'O*NET Online', 'Business Intelligence Analysts', 'https://www.onetonline.org/link/summary/15-2051.01'),
  ('ui-ux-designer', 'O*NET Online', 'Web and Digital Interface Designers', 'https://www.onetonline.org/link/summary/15-1255.00'),
  ('cloud-engineer', '커리어넷', '클라우드 시스템 엔지니어', 'https://www.career.go.kr/cloud/m/job/view?seq=10031'),
  ('mobile-app-developer', '커리어넷', '응용소프트웨어 관련 직업', 'https://www.career.go.kr/cloud/w/major/hView?seq=31'),
  ('mobile-app-developer', 'O*NET Online', 'Software Developers', 'https://www.onetonline.org/link/summary/15-1252.00'),
  ('game-programmer', '커리어넷', '게임기획자와 게임 제작 관련 직무', 'https://www.career.go.kr/cloud/m/job/view?seq=923'),
  ('game-programmer', 'O*NET Online', 'Software Developers', 'https://www.onetonline.org/link/summary/15-1252.00'),
  ('systems-software-developer', '커리어넷', '시스템소프트웨어개발자', 'https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=834'),
  ('embedded-software-developer', '커리어넷', '시스템소프트웨어개발자 · 임베디드·펌웨어', 'https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=834'),
  ('iot-developer', '주니어 커리어넷', '사물인터넷(IoT) 개발자', 'https://www.career.go.kr/cloud/j/job/view?seq=10796'),
  ('qa-engineer', 'O*NET Online', 'Software Quality Assurance Analysts and Testers', 'https://www.onetonline.org/link/summary/15-1253.00'),
  ('xr-developer', '주니어 커리어넷', '가상현실전문가', 'https://www.career.go.kr/cloud/j/job/view?seq=10684'),
  ('blockchain-developer', 'O*NET Online', 'Blockchain Engineers', 'https://www.onetonline.org/link/summary/15-1299.07'),
  ('data-engineer', 'O*NET Online', 'Database Architects', 'https://www.onetonline.org/link/summary/15-1243.00'),
  ('data-engineer', 'O*NET Online', 'Data Warehousing Specialists', 'https://www.onetonline.org/link/summary/15-1243.01'),
  ('data-scientist', 'O*NET Online', 'Data Scientists', 'https://www.onetonline.org/link/summary/15-2051.00'),
  ('database-developer', '고용24 · 대입정보포털', '데이터베이스개발자', 'https://www.adiga.kr/jbp/jnf/jobInfoDetail.do?menuId=PCJBPJNF2000&searchCrCd=134101&searchCrSeClsfCd=131'),
  ('nlp-engineer', '커리어넷', '인공지능 엔지니어', 'https://www.career.go.kr/cloud/m/job/view?seq=10117'),
  ('computer-vision-engineer', '커리어넷', '인공지능 엔지니어', 'https://www.career.go.kr/cloud/m/job/view?seq=10117'),
  ('game-designer', '커리어넷', '게임기획자', 'https://www.career.go.kr/cloud/m/job/view?seq=923'),
  ('game-designer', 'O*NET Online', 'Video Game Designers', 'https://www.onetonline.org/link/summary/15-1255.01'),
  ('web-service-planner', '커리어넷', '웹프로듀서', 'https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=1096'),
  ('network-engineer', '고용24 · 대입정보포털', '네트워크시스템개발자', 'https://www.adiga.kr/jbp/jnf/jobInfoDetail.do?menuId=PCJBPJNF2000&searchCrCd=K000000968&searchCrSeClsfCd=D999'),
  ('network-engineer', '커리어넷', '네트워크엔지니어', 'https://www.career.go.kr/cnet/app/base/job/jobView.m?SEQ=430'),
  ('systems-architect', '고용24 · 대입정보포털', '컴퓨터시스템설계분석가', 'https://www.adiga.kr/jbp/jnf/jobInfoDetail.do?menuId=PCJBPJNF2000&searchCrCd=K000000856'),
  ('devops-engineer', '미국 노동통계국 (BLS)', 'Network and Computer Systems Administrators · DevOps', 'https://www.bls.gov/ooh/Computer-and-Information-Technology/Network-and-computer-systems-administrators.htm'),
  ('systems-administrator', '한국고용정보원', '직업별 활용 기술 및 도구 · 정보시스템운영자', 'https://www.keis.or.kr/keis/ko/proj/114/pblc/detail.do?categoryIdx=125&pubIdx=11203'),
  ('systems-administrator', 'O*NET Online', 'Network and Computer Systems Administrators', 'https://www.onetonline.org/link/summary/15-1244.00'),
  ('security-analyst', 'O*NET Online', 'Information Security Analysts', 'https://www.onetonline.org/link/summary/15-1212.00'),
  ('security-engineer', '커리어넷', '정보보호전문가', 'https://www.career.go.kr/cloud/m/job/view?seq=435'),
  ('security-engineer', 'O*NET Online', 'Information Security Engineers', 'https://www.onetonline.org/link/summary/15-1299.05'),
  ('digital-forensics-analyst', 'O*NET Online', 'Digital Forensics Analysts', 'https://www.onetonline.org/link/summary/15-1299.06')
on conflict (career_slug, url) do nothing;

-- Curated against course codes in the Class2Career computer science curricula.
with links (career_slug, course_code, sort_order, concepts) as (
  values
    ('frontend-developer', 'ITEC0416', 1, '웹 서비스 구현과 사용자 인터페이스'),
    ('frontend-developer', 'COMP0224', 2, '소프트웨어 구조와 설계 원칙'),
    ('frontend-developer', 'COME0331', 3, '자료 구조와 알고리즘 기초'),
    ('frontend-developer', 'COMP0322', 4, '데이터 모델링과 데이터베이스 활용'),
    ('frontend-developer', 'COMP0422', 5, '협업 개발과 소프트웨어 품질'),
    ('frontend-developer', 'COMP0455', 6, '사용자 경험과 지능형 인터페이스'),
    ('backend-developer', 'COME0331', 1, '자료 구조와 알고리즘 기초'),
    ('backend-developer', 'COMP0322', 2, '데이터 모델링과 데이터베이스 활용'),
    ('backend-developer', 'COMP0312', 3, '프로세스와 메모리 관리'),
    ('backend-developer', 'COMP0414', 4, '네트워크 구조와 통신 원리'),
    ('backend-developer', 'COMP0422', 5, '시스템 설계와 테스트'),
    ('backend-developer', 'COMP0341', 6, '인증·인가와 웹 보안'),
    ('backend-developer', 'GLSO0227', 7, '확장 가능한 클라우드 환경'),
    ('ai-engineer', 'MTED0231', 1, '벡터와 행렬 연산'),
    ('ai-engineer', 'COME0311', 2, '확률 분포와 통계적 추론'),
    ('ai-engineer', 'ITEC0417', 3, '기계학습 모델과 학습 방법'),
    ('ai-engineer', 'MOBI0224', 4, '신경망과 딥러닝 모델'),
    ('ai-engineer', 'COMP0324', 5, '인공지능의 핵심 원리'),
    ('ai-engineer', 'CAIB0234', 6, '신경망 구조와 학습 원리'),
    ('data-analyst', 'COME0311', 1, '기술 통계와 가설 검정'),
    ('data-analyst', 'COMP0322', 2, '데이터 저장과 SQL'),
    ('data-analyst', 'COMP0333', 3, '파이썬 기반 데이터 분석'),
    ('data-analyst', 'ITEC0419', 4, '데이터 과학의 기초 방법론'),
    ('data-analyst', 'COMP0462', 5, '데이터 패턴 탐색과 분석'),
    ('data-analyst', 'ITEC0417', 6, '예측 모델과 성능 평가'),
    ('ui-ux-designer', 'COMP0455', 1, '사용자 경험과 인터랙션 설계'),
    ('ui-ux-designer', 'COMP0435', 2, '디지털 콘텐츠와 시각 표현'),
    ('ui-ux-designer', 'COMP0413', 3, '컴퓨터 그래픽과 시각화 원리'),
    ('ui-ux-designer', 'ITEC0416', 4, '웹 화면 구현과 인터랙션'),
    ('ui-ux-designer', 'COMP0436', 5, '증강현실 기반 사용자 경험'),
    ('cloud-engineer', 'COMP0312', 1, '프로세스와 시스템 자원 관리'),
    ('cloud-engineer', 'COMP0414', 2, '네트워크 구조와 통신 원리'),
    ('cloud-engineer', 'EECS0312', 3, '네트워크 서비스 프로그래밍'),
    ('cloud-engineer', 'GLSO0227', 4, '가상화와 클라우드 인프라'),
    ('cloud-engineer', 'ELEC0462', 5, '운영체제 기반 시스템 개발'),
    ('cloud-engineer', 'COMP0345', 6, '인프라 보안의 기초'),
    ('mobile-app-developer', 'COMP0217', 1, '자바 프로그램의 객체와 인터페이스'),
    ('mobile-app-developer', 'COMP0328', 2, '모바일 앱 화면과 이벤트 처리'),
    ('mobile-app-developer', 'COMP0420', 3, '모바일 앱의 데이터 저장과 서비스 연동'),
    ('mobile-app-developer', 'COMP0340', 4, '모바일 기기의 자원과 실행 환경'),
    ('game-programmer', 'COME0331', 1, '게임 상태를 표현하는 자료구조'),
    ('game-programmer', 'COMP0413', 2, '변환, 카메라와 실시간 렌더링'),
    ('game-programmer', 'ITEC0425', 3, '게임 루프, 입력 처리와 충돌 구현'),
    ('game-programmer', 'COMP0319', 4, '게임 로직의 시간 복잡도와 탐색'),
    ('systems-software-developer', 'COMP0411', 1, '명령어 실행과 메모리 계층'),
    ('systems-software-developer', 'COMP0312', 2, '프로세스, 동시성과 가상 메모리'),
    ('systems-software-developer', 'ELEC0462', 3, '시스템 호출과 파일 입출력'),
    ('systems-software-developer', 'COMP0321', 4, '소스 코드 분석과 명령어 생성'),
    ('embedded-software-developer', 'COMP0225', 1, '디지털 회로와 상태 제어'),
    ('embedded-software-developer', 'COMP0411', 2, '프로세서와 장치 입출력'),
    ('embedded-software-developer', 'ELEC0462', 3, '저수준 입출력과 메모리 관리'),
    ('embedded-software-developer', 'GLSO0224', 4, '센서 연결과 장치 데이터 수집'),
    ('iot-developer', 'GLSO0224', 1, '센서 데이터 수집과 기기 연결'),
    ('iot-developer', 'COMP0414', 2, '통신 계층과 기기 간 연결'),
    ('iot-developer', 'EECS0312', 3, '네트워크 기반 기기 메시지 처리'),
    ('iot-developer', 'GLSO0227', 4, '기기 데이터를 처리하는 클라우드 인프라'),
    ('qa-engineer', 'COMP0224', 1, '요구사항과 컴포넌트 설계 검토'),
    ('qa-engineer', 'COMP0422', 2, '개발 생명주기와 품질 관리'),
    ('qa-engineer', 'ITEC0414', 3, '테스트 케이스 설계와 결함 검증'),
    ('qa-engineer', 'GLSO0219', 4, '테스트 실행 및 결과 관리'),
    ('xr-developer', 'MTED0231', 1, '공간과 좌표계의 벡터·행렬 표현'),
    ('xr-developer', 'COMP0413', 2, '3차원 장면의 변환과 렌더링'),
    ('xr-developer', 'COMP0436', 3, '현실 공간 추적과 가상 객체 정합'),
    ('xr-developer', 'COMP0455', 4, '몰입형 인터페이스와 상호작용 설계'),
    ('blockchain-developer', 'COME0301', 1, '그래프와 논리적 모델링'),
    ('blockchain-developer', 'COMP0345', 2, '해시, 전자서명과 무결성'),
    ('blockchain-developer', 'COMP0414', 3, '분산 노드 간 네트워크 통신'),
    ('blockchain-developer', 'COMP0322', 4, '데이터 일관성과 트랜잭션'),
    ('data-engineer', 'COMP0322', 1, '스키마, 쿼리와 데이터 무결성'),
    ('data-engineer', 'COMP0333', 2, '파이썬 기반 데이터 정제와 변환'),
    ('data-engineer', 'ITEC0418', 3, '대용량 데이터의 분할과 병렬 처리'),
    ('data-engineer', 'GLSO0227', 4, '클라우드 저장소와 처리 환경'),
    ('data-scientist', 'COME0311', 1, '통계적 추론과 가설 검정'),
    ('data-scientist', 'ITEC0419', 2, '탐색적 분석과 실험 설계 기초'),
    ('data-scientist', 'ITEC0417', 3, '예측 모델의 학습과 성능 비교'),
    ('data-scientist', 'COMP0462', 4, '데이터의 패턴 탐색과 군집 분석'),
    ('database-developer', 'COME0331', 1, '인덱스 이해에 필요한 트리 구조'),
    ('database-developer', 'COMP0322', 2, '관계형 모델, SQL과 트랜잭션'),
    ('database-developer', 'COMP0312', 3, '동시성 제어와 파일 시스템'),
    ('database-developer', 'COMP0224', 4, '서비스에서의 데이터 계층 설계'),
    ('nlp-engineer', 'CAIB0211', 1, '텍스트 표현과 자연어 처리 모델'),
    ('nlp-engineer', 'COMP0419', 2, '색인과 검색 결과 평가'),
    ('nlp-engineer', 'ITEC0417', 3, '학습과 검증 데이터 분리 및 평가'),
    ('nlp-engineer', 'MOBI0224', 4, '텍스트 모델 이해에 필요한 딥러닝'),
    ('computer-vision-engineer', 'MTED0231', 1, '영상 변환에 활용되는 선형대수'),
    ('computer-vision-engineer', 'ITEC0424', 2, '영상 특징 추출과 객체 인식'),
    ('computer-vision-engineer', 'CAIB0233', 3, '영상 속 패턴과 장면의 해석'),
    ('computer-vision-engineer', 'MOBI0224', 4, '영상 분류를 위한 신경망 학습'),
    ('game-designer', 'ITEC0425', 1, '규칙과 레벨의 프로토타이핑'),
    ('game-designer', 'COMP0455', 2, '플레이어 인터랙션과 사용성 평가'),
    ('game-designer', 'COMP0435', 3, '게임 콘텐츠의 시각 표현'),
    ('web-service-planner', 'COMP0224', 1, '사용자 요구사항과 기능 명세'),
    ('web-service-planner', 'COMP0455', 2, '서비스 흐름과 사용성 검토'),
    ('web-service-planner', 'ITEC0416', 3, '화면과 서버가 동작하는 방식'),
    ('network-engineer', 'COMP0323', 1, '데이터 전송과 오류 제어'),
    ('network-engineer', 'COMP0414', 2, '주소 지정과 라우팅, 통신 계층'),
    ('network-engineer', 'EECS0312', 3, '소켓과 클라이언트·서버 통신'),
    ('network-engineer', 'GLSO0227', 4, '클라우드 네트워크 구성'),
    ('systems-architect', 'COMP0224', 1, '요구사항 분석과 설계 모델링'),
    ('systems-architect', 'COMP0422', 2, '소프트웨어 구조와 시스템 통합'),
    ('systems-architect', 'COMP0322', 3, '시스템 간 데이터 모델 설계'),
    ('systems-architect', 'COMP0414', 4, '분산 서비스의 통신 구조'),
    ('devops-engineer', 'COMP0312', 1, '서비스 프로세스와 시스템 자원'),
    ('devops-engineer', 'COMP0422', 2, '형상 관리와 개발·배포 과정'),
    ('devops-engineer', 'GLSO0219', 3, '배포 과정의 반복 검증과 테스트'),
    ('devops-engineer', 'GLSO0227', 4, '서비스 배포와 실행 인프라'),
    ('systems-administrator', 'COMP0312', 1, '프로세스, 저장 장치와 자원 관리'),
    ('systems-administrator', 'COMP0414', 2, '서버의 네트워크 연결과 진단'),
    ('systems-administrator', 'ELEC0462', 3, '파일·프로세스 자동화의 기초'),
    ('systems-administrator', 'GLSO0227', 4, '가상 서버와 스토리지 관리'),
    ('security-analyst', 'COMP0345', 1, '보안 위협 유형과 사고 대응 기초'),
    ('security-analyst', 'COMP0414', 2, '네트워크 트래픽의 정상 동작 이해'),
    ('security-analyst', 'COMP0312', 3, '운영체제의 프로세스와 파일 활동'),
    ('security-analyst', 'COMP0341', 4, '웹 서비스 인증과 세션 보안'),
    ('security-engineer', 'COME0368', 1, '정보 보호와 암호화 원리'),
    ('security-engineer', 'COMP0341', 2, '웹 애플리케이션 접근 제어'),
    ('security-engineer', 'COMP0414', 3, '보안 경계를 설계하기 위한 네트워크 구조'),
    ('security-engineer', 'GLSO0227', 4, '클라우드 운영 환경과 구성 관리'),
    ('digital-forensics-analyst', 'COMP0312', 1, '파일 시스템과 운영체제의 흔적'),
    ('digital-forensics-analyst', 'ELEC0462', 2, '파일 메타데이터와 저장 구조의 이해'),
    ('digital-forensics-analyst', 'COMP0345', 3, '증거 보존에 필요한 무결성과 해시'),
    ('digital-forensics-analyst', 'COMP0414', 4, '통신 기록 해석을 위한 네트워크 기초')
),
curriculum_courses as (
  select distinct c.course_code, c.id
  from public.c2c_courses c
  join public.c2c_curriculum_courses cc on cc.course_id = c.id
  where c.course_code in (select course_code from links)
)
insert into public.c2c_career_courses (career_slug, course_id, sort_order, concepts)
select links.career_slug, (
  select c.id from curriculum_courses c where c.course_code = links.course_code
), links.sort_order, links.concepts
from links
on conflict (career_slug, course_id) do nothing;

commit;

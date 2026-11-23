-- Fill courses currently missing concepts and align equivalent/near-equivalent courses.
-- Source course IDs and names were read from the live public catalog on 2026-11-22.
-- Safe to rerun. Similar course pairs share the same slug/name/description set.
begin;

insert into public.c2c_course_concepts
  (course_id, slug, name, concept_group, description, sort_order)
values
  -- 회계와 사회생활 (14)
  (14,'accounting-assets-liabilities','자산·부채·자본','회계 기초','개인과 조직의 경제적 자원·의무·순자산을 구분하고 재무 상태를 읽습니다.',10),
  (14,'income-expenses','수익과 비용','회계 기초','일정 기간의 수익과 비용을 구분해 경제 활동의 결과를 해석합니다.',20),
  (14,'financial-statements','재무제표 읽기','회계 기초','재무상태표·손익계산서·현금흐름표가 제공하는 정보를 이해합니다.',30),
  (14,'budgeting-cashflow','예산과 현금 흐름','생활 재무','수입·지출을 계획하고 현금 흐름을 관리해 재무 목표를 세웁니다.',40),
  (14,'credit-interest-debt','신용·이자·부채','생활 재무','신용 점수, 복리 이자, 대출 비용과 상환 계획의 관계를 분석합니다.',50),
  (14,'tax-insurance-risk','세금·보험·위험 관리','생활 재무','세금과 보험의 기본 원리 및 개인 재무 위험을 관리하는 방법을 살펴봅니다.',60),

  -- 확률및통계 (22)
  (22,'probability-random-variables','확률과 확률 변수','확률 기초','사건·조건부 확률·확률 변수를 이용해 불확실한 현상을 수량화합니다.',10),
  (22,'common-distributions','확률 분포','확률 기초','이산·연속 확률 분포와 기댓값·분산으로 데이터 생성 과정을 모델링합니다.',20),
  (22,'sampling-central-limit','표본과 중심극한정리','통계적 추론','표본 추출과 표본 분포가 모집단 추론에 미치는 영향을 이해합니다.',30),
  (22,'estimation-confidence-interval','추정과 신뢰 구간','통계적 추론','점 추정·구간 추정으로 모수를 추정하고 불확실성을 표현합니다.',40),
  (22,'hypothesis-testing','가설 검정','통계적 추론','귀무·대립 가설, 유의수준, p값과 검정력을 이용해 증거를 평가합니다.',50),
  (22,'correlation-regression','상관과 회귀','통계적 모델링','변수 간 관계를 상관과 회귀로 분석하고 인과 해석의 한계를 구분합니다.',60),

  -- 컴퓨터그래픽스 (61)
  (61,'graphics-coordinate-transform','좌표계와 기하 변환','컴퓨터 그래픽스','모델·세계·카메라·화면 좌표계를 연결하고 이동·회전·크기 변환을 계산합니다.',10),
  (61,'viewing-projection','뷰잉과 투영','컴퓨터 그래픽스','3차원 장면을 카메라 관점에서 2차원 화면으로 투영하는 과정을 이해합니다.',20),
  (61,'rasterization-visibility','래스터화와 가시성','컴퓨터 그래픽스','기하 도형을 픽셀로 변환하고 깊이·가림 관계에 따라 보이는 표면을 결정합니다.',30),
  (61,'shading-lighting','조명과 셰이딩','컴퓨터 그래픽스','광원·재질·표면 법선으로 물체의 색과 밝기를 계산하는 기본 모델을 다룹니다.',40),
  (61,'texture-mapping','텍스처 매핑','컴퓨터 그래픽스','2차원 이미지 정보를 표면에 대응시켜 세부 무늬와 재질감을 표현합니다.',50),
  (61,'graphics-pipeline-gpu','그래픽스 파이프라인과 GPU','컴퓨터 그래픽스','정점 처리부터 프래그먼트 출력까지의 파이프라인과 GPU 병렬 처리를 이해합니다.',60),

  -- 프로그래밍언어론 (66)
  (66,'language-syntax-semantics','문법과 의미론','프로그래밍 언어 기초','형식 문법으로 구문을 정의하고 프로그램 실행 의미를 정적으로·동적으로 설명합니다.',10),
  (66,'types-type-systems','타입과 타입 시스템','프로그래밍 언어 기초','타입 규칙이 오류를 예방하고 표현 가능한 프로그램을 제한하는 방식을 이해합니다.',20),
  (66,'scope-binding-environments','범위와 이름 결합','프로그래밍 언어 기초','정적·동적 범위, 이름 해석, 환경과 저장 위치의 관계를 살펴봅니다.',30),
  (66,'evaluation-control-flow','평가와 제어 흐름','언어 실행 모델','표현식 평가 순서, 값 전달 방식, 예외·제어 구조의 실행 의미를 비교합니다.',40),
  (66,'programming-paradigms','프로그래밍 패러다임','언어 설계','명령형·객체지향·함수형·논리형 패러다임의 추상화와 계산 방식을 비교합니다.',50),
  (66,'runtime-memory-management','런타임과 메모리 관리','언어 구현','스택·힙·가비지 컬렉션 및 실행 환경이 언어 프로그램에 제공하는 기능을 이해합니다.',60),

  -- 컴퓨팅사고와 SW코딩 (70)
  (70,'computational-problem-formulation','문제 분해와 표현','컴퓨팅 사고','문제를 작은 부분으로 나누고 입력·출력·조건을 명확하게 표현합니다.',10),
  (70,'pattern-abstraction','패턴과 추상화','컴퓨팅 사고','반복되는 구조를 찾아 일반화하고 핵심만 남겨 문제 모델을 만듭니다.',20),
  (70,'algorithmic-thinking','알고리즘적 사고','컴퓨팅 사고','목표를 달성하는 유한하고 명확한 단계와 의사결정 순서를 설계합니다.',30),
  (70,'basic-sequences-condition-loops','순차·선택·반복','SW 코딩','명령 실행 순서, 조건 분기와 반복을 조합해 동작을 표현합니다.',40),
  (70,'variables-data-representation','변수와 데이터 표현','SW 코딩','변수·자료형·리스트 등으로 정보를 표현하고 계산 과정에서 갱신합니다.',50),
  (70,'code-testing-debugging','코드 시험과 디버깅','SW 코딩','예상 결과와 실제 실행을 비교하고 오류를 찾아 수정하는 과정을 익힙니다.',60),

  -- 클라우드컴퓨팅 (94)
  (94,'cloud-service-models','클라우드 서비스 모델','클라우드 구조','IaaS·PaaS·SaaS가 제공하는 관리 범위와 사용자의 책임 차이를 이해합니다.',10),
  (94,'virtualization-containers','가상화와 컨테이너','클라우드 구조','가상 머신과 컨테이너가 컴퓨팅 자원을 격리·배포하는 방식을 비교합니다.',20),
  (94,'cloud-compute-storage-network','클라우드 컴퓨팅·저장·네트워크','클라우드 자원','가상 서버·객체 저장소·가상 네트워크를 조합해 애플리케이션 기반을 구성합니다.',30),
  (94,'elasticity-load-balancing','탄력성과 부하 분산','클라우드 운영','수요에 따라 자원을 확장·축소하고 부하 분산으로 가용성을 높입니다.',40),
  (94,'cloud-iam-security','클라우드 보안과 IAM','클라우드 보안','최소 권한 정책·비밀 관리·네트워크 경계로 클라우드 자원을 보호합니다.',50),
  (94,'cloud-observability-cost','관측성과 비용 관리','클라우드 운영','로그·메트릭·추적을 이용해 상태를 파악하고 사용량·비용을 최적화합니다.',60),

  -- 컴퓨터학개론 (96)
  (96,'computer-data-representation','데이터와 수의 표현','컴퓨터 기초','이진수·문자·정수·실수 표현과 데이터 인코딩의 기초를 이해합니다.',10),
  (96,'computer-hardware-software','컴퓨터 하드웨어와 소프트웨어','컴퓨터 기초','프로세서·메모리·입출력 장치와 운영체제·응용 프로그램의 역할을 구분합니다.',20),
  (96,'programming-algorithms-intro','알고리즘과 프로그래밍','컴퓨터 기초','절차를 알고리즘으로 표현하고 프로그램으로 구현하는 기본 흐름을 익힙니다.',30),
  (96,'data-structures-intro','자료구조 기초','컴퓨터 기초','배열·리스트·스택·큐·트리 등 데이터 저장 구조와 사용 목적을 살펴봅니다.',40),
  (96,'networks-internet-intro','네트워크와 인터넷','컴퓨터 기초','주소·프로토콜·라우팅의 기초와 인터넷 서비스가 통신하는 방식을 이해합니다.',50),
  (96,'computing-security-society','컴퓨팅과 보안·사회','컴퓨터 기초','개인정보·보안·저작권·접근성 등 컴퓨팅 기술의 사회적 영향을 검토합니다.',60),

  -- 학교현장실습 (111)
  (111,'school-practicum-observation','수업 관찰과 학교 맥락','학교현장실습','학교 조직·학급 환경과 수업 장면을 관찰해 학습자와 교육 맥락을 이해합니다.',10),
  (111,'lesson-planning-objectives','수업 목표와 지도안','학교현장실습','학습 목표·내용·활동·평가를 정렬한 컴퓨터 수업 지도안을 작성합니다.',20),
  (111,'classroom-instruction','수업 실행과 설명','학교현장실습','학습자 수준에 맞게 개념을 설명하고 질문·실습·토론을 운영합니다.',30),
  (111,'classroom-management-inclusion','학급 운영과 포용','학교현장실습','수업 참여·시간·기기 사용을 관리하고 다양한 학습자의 접근성을 고려합니다.',40),
  (111,'learning-assessment-feedback','학습 평가와 피드백','학교현장실습','형성·총괄 평가로 이해도를 확인하고 구체적인 피드백으로 학습을 지원합니다.',50),
  (111,'practicum-reflection-ethics','성찰과 교사 윤리','학교현장실습','수업 증거를 바탕으로 개선점을 성찰하고 학생 정보·안전·교직 윤리를 지킵니다.',60),

  -- 컴퓨터교육론 (112)
  (112,'cs-education-goals','컴퓨터 교육 목표와 교육과정','컴퓨터교육론','컴퓨터과학 교육의 목표와 핵심 개념을 교육과정 수준·학습자 발달에 맞게 구성합니다.',10),
  (112,'cs-pedagogy-concept-learning','컴퓨터 개념 학습과 교수법','컴퓨터교육론','추상 개념의 오개념과 인지 부담을 고려해 설명·예제·실습을 설계합니다.',20),
  (112,'programming-education-approaches','프로그래밍 교육 접근','컴퓨터교육론','블록·텍스트 기반 코딩, 프로젝트·문제 기반 학습의 특징과 선택 기준을 비교합니다.',30),
  (112,'computational-thinking-assessment','컴퓨팅 사고 평가','컴퓨터교육론','알고리즘·분해·추상화 역량을 관찰 가능한 과제와 루브릭으로 평가합니다.',40),
  (112,'equity-accessibility-cs','컴퓨터 교육의 형평성과 접근성','컴퓨터교육론','성별·배경·장애에 따른 참여 격차를 살피고 포용적 학습 환경을 설계합니다.',50),
  (112,'cs-education-research','컴퓨터 교육 연구와 근거','컴퓨터교육론','교육 연구 결과를 비판적으로 읽고 근거 기반 수업 개선에 적용합니다.',60),

  -- 컴퓨터교재연구및지도법 (113)
  (113,'textbook-curriculum-alignment','교재와 교육과정 정렬','컴퓨터 교재와 지도법','교육과정 성취 기준과 교재의 개념·활동·평가가 일치하는지 분석합니다.',10),
  (113,'learning-material-analysis','교재 내용과 난이도 분석','컴퓨터 교재와 지도법','개념 정확성·선수 지식·표현 방식·학습자 부담을 기준으로 자료를 검토합니다.',20),
  (113,'lesson-design-materials','교수학습 자료 설계','컴퓨터 교재와 지도법','설명 자료·예제·실습·평가를 학습 목표에 맞춰 개발합니다.',30),
  (113,'teaching-strategies-cs','컴퓨터 교과 지도 전략','컴퓨터 교재와 지도법','시연·실습·협력·프로젝트 전략을 내용과 학습자에 맞게 선택합니다.',40),
  (113,'assessment-rubrics','평가 도구와 루브릭','컴퓨터 교재와 지도법','코드·과정·협업 결과를 타당하고 일관되게 평가하는 기준을 구성합니다.',50),
  (113,'material-pilot-revision','수업 자료 시험과 개선','컴퓨터 교재와 지도법','학습자 반응과 평가 결과로 자료의 명료성·접근성·효과를 점검하고 수정합니다.',60),

  -- 컴퓨터윤리 (259)
  (259,'privacy-data-governance','개인정보와 데이터 거버넌스','컴퓨터 윤리','수집·이용·보관·공유 과정의 개인정보 권리와 책임을 분석합니다.',10),
  (259,'algorithmic-bias-fairness','알고리즘 편향과 공정성','컴퓨터 윤리','데이터·모델·배포 과정의 편향이 개인과 집단에 미치는 영향을 평가합니다.',20),
  (259,'security-responsibility','보안과 전문가 책임','컴퓨터 윤리','보안 취약점 공개·대응과 시스템 운영자의 책임 있는 의사결정을 다룹니다.',30),
  (259,'intellectual-property-open-source','지식재산과 오픈소스 윤리','컴퓨터 윤리','저작권·특허·라이선스를 준수하고 디지털 창작물과 오픈소스 기여를 책임 있게 다룹니다.',40),
  (259,'accessibility-digital-divide','접근성과 디지털 격차','컴퓨터 윤리','기술 접근성·장애 포용·디지털 자원 격차가 기회에 미치는 영향을 분석합니다.',50),
  (259,'ai-accountability-society','AI 책임성과 사회적 영향','컴퓨터 윤리','자동화의 투명성·설명·책임 소재와 사회·환경적 영향을 사례로 검토합니다.',60),

  -- 컴퓨터게임제작 (295)
  (295,'game-loop-input-state','게임 루프와 상태','컴퓨터 게임 제작','입력·업데이트·렌더링 반복 구조와 게임 상태 전이를 설계합니다.',10),
  (295,'game-physics-collision','게임 물리와 충돌','컴퓨터 게임 제작','좌표·속도·중력과 충돌 검출·반응을 이용해 상호작용을 구현합니다.',20),
  (295,'game-graphics-animation','그래픽과 애니메이션','컴퓨터 게임 제작','스프라이트·모델·애니메이션을 시간 흐름과 장면 구성에 맞게 표현합니다.',30),
  (295,'game-ai-behavior','게임 AI와 행동','컴퓨터 게임 제작','유한 상태 기계·경로 탐색 등으로 게임 객체의 반응과 행동을 구성합니다.',40),
  (295,'game-level-design','레벨과 사용자 경험 설계','컴퓨터 게임 제작','목표·난이도·피드백·보상으로 플레이 흐름과 사용자 경험을 설계합니다.',50),
  (295,'game-testing-performance','게임 시험과 성능','컴퓨터 게임 제작','플레이 테스트·버그 추적·프레임 성능 측정으로 게임의 품질을 개선합니다.',60)
on conflict (course_id, slug) do update set
  name = excluded.name,
  concept_group = excluded.concept_group,
  description = excluded.description,
  sort_order = excluded.sort_order;

-- Make equivalent database courses share one canonical concept set.
delete from public.c2c_course_concepts where course_id = 42;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 42, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 25;

-- Information security course titles refer to the same core subject.
delete from public.c2c_course_concepts where course_id = 59;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 59, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 24;

-- Computer-network course shares the data-communication concept set.
delete from public.c2c_course_concepts where course_id = 62;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 62, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 43;

-- Computer vision and image understanding are represented by the same concept set.
delete from public.c2c_course_concepts where course_id = 105;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 105, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 8;

-- Basic programming names are near-synonyms in the catalog.
delete from public.c2c_course_concepts where course_id = 26;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 26, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 28;

-- Programming exercises 1-4 share the same hands-on programming concept catalog.
delete from public.c2c_course_concepts where course_id in (46,48,51,52);
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select target.course_id, source.slug, source.name, source.concept_group, source.description, source.sort_order
from (values (46::bigint),(48::bigint),(51::bigint),(52::bigint)) as target(course_id)
cross join public.c2c_course_concepts as source
where source.course_id = 29;

-- The two software-testing courses share one concept set.
delete from public.c2c_course_concepts where course_id = 92;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 92, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 99;

-- Computer architecture course shares the advanced course's concept vocabulary.
delete from public.c2c_course_concepts where course_id = 60;
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select 60, slug, name, concept_group, description, sort_order
from public.c2c_course_concepts where course_id = 77;

-- Broad computing seminar courses share the same seminar learning structure.
delete from public.c2c_course_concepts where course_id in (57,58);
insert into public.c2c_course_concepts (course_id, slug, name, concept_group, description, sort_order)
select target.course_id, source.slug, source.name, source.concept_group, source.description, source.sort_order
from (values (57::bigint),(58::bigint)) as target(course_id)
cross join public.c2c_course_concepts as source
where source.course_id = 68;

commit;

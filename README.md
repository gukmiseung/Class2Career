# 🎓 Class2Career

> **내가 배우는 수업은 어디에 쓰일까?**
> 전공 교과목에서 관련 직무와 실무 활용 사례까지, 진로 탐색을 한 흐름으로 연결합니다.

2026 해커톤 · 팀 **컴작귀** (5명)

### 🔗 [**배포 사이트 바로가기 → class2-career-five.vercel.app**](https://class2-career-five.vercel.app)

---

## 💡 서비스 소개

전공 수업을 듣다 보면 *"이걸 배워서 어디에 쓰지?"* 싶을 때가 많습니다. 반대로 관심 직무가 생겨도 어떤 과목부터 봐야 할지 막막하고요.

저희도 같은 고민을 하다가 학생 **59명**에게 설문을 돌려 봤습니다.

| 🙋 수업이 어디에 쓰일지 궁금했던 적이 있다 | 🙌 수업과 직무를 이어 주는 사이트를 써보고 싶다 |
| :---: | :---: |
| **97%** | **97%** |
| 자주 80% · 가끔 17% | 잘 모르겠다 3% · 아니다 0% |

대부분이 같은 고민을 하고 있었고, 연결해 줄 서비스를 원했습니다. 그래서 **Class2Career**를 만들었습니다.

**과목에서 시작해도, 직무에서 시작해도** 서로가 연결됩니다.

| 📚 전공에서 직무로 | 💼 직무에서 전공으로 |
| --- | --- |
| "이 과목, 어디에 쓰일까?" | "이 직무엔 어떤 과목이 필요할까?" |
| 과목 선택 → 개념 분석 → 활용 사례 → 관련 직무 | 직무 선택 → 필요한 과목 → 과목 노트 → 로드맵 |

---

## ✨ 주요 기능

| 🔍 과목별 직무 탐색 | 🛠 실무 활용 사례 | 🗺 학습 로드맵 |
| --- | --- | --- |
| 전공 교과목을 기준으로 연결되는 직무를 찾아 줍니다. | 배운 개념이 직무에서 어떻게 쓰이는지 사례 카드로 보여 줍니다. | 관심 직무에 필요한 추가 학습과 프로젝트, 관련 공모전을 안내합니다. |

- **실무 활용 사례**는 Gemini API로 생성하고, 한 번 만든 결과는 DB에 저장해서 같은 개념을 다시 볼 때 재사용합니다. 특정 기업의 검증된 사례가 아니라 이해를 돕기 위한 예시입니다.
- **학습 로드맵**은 OpenAI API로 생성하며, 이미 들은 과목은 빼고 아직 듣지 않은 과목 위주로 추천합니다.
- **나의 학습 현황**에서 수강 과목을 `수강 완료` / `수강 중` / `수강 예정`으로 관리하고, 관심 직무와 과목별 메모를 남길 수 있습니다.

> 🔑 과목·직무 탐색은 **로그인 없이** 쓸 수 있고, AI 사례 생성 · 로드맵 생성 · 학습 기록 저장은 로그인이 필요합니다.

### 이런 식으로 연결돼요

| 전공 교과목 | 관련 직무 | 실무 활용 예시 |
| --- | --- | --- |
| 데이터베이스 | 데이터 엔지니어 · 백엔드 개발자 | 대용량 서비스의 데이터 설계와 쿼리 최적화 |
| 알고리즘 | 소프트웨어 엔지니어 | 검색·추천 같은 서비스 로직의 성능 개선 |
| 운영체제 | 시스템·인프라 엔지니어 | 서버 자원 관리와 장애 대응 |

*서비스 이해를 돕기 위한 예시입니다.*

---

## 🚀 사용 방법

**🔐 로그인한 경우**
1. **과목 등록** — 수강 중인 전공 과목 추가
2. **개념 선택** — 과목에서 궁금한 개념 고르기
3. **개념 분석** — 관련 직무와 실무 활용 사례 확인
4. **로드맵** — 관심 직무에 필요한 추가 학습과 프로젝트 확인
5. **학습 현황** — 진행 상황 관리

**👤 로그인하지 않은 경우**
1. **직무 탐색** — 관심 직무 선택
2. **관련 과목** — 필요한 전공 과목 확인
3. **로드맵** — 학습 방향 확인

📱 모바일과 PC 모두 접속할 수 있습니다.

---

## 🆚 다른 진로 탐색과 뭐가 달라요?

| | 일반적인 진로 탐색 | **Class2Career** |
| --- | --- | --- |
| 출발점 | 직무 · 채용공고 | **내가 배운 전공 교과목** |
| 탐색 방향 | 직무 → 내 전공 | **전공 ↔ 직무 양방향** |
| 그 다음 | 조회로 끝남 | **로드맵 · 학습 현황으로 이어짐** |

---

## 🛠 기술 스택

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Gemini](https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

| 구분 | 기술 | 사용한 곳 |
| --- | --- | --- |
| Frontend | React, TypeScript, Vite | 과목·직무 탐색, 사례 카드, 로드맵, 학습 현황 화면 |
| Backend / DB | Supabase (Auth, PostgreSQL, RLS, Edge Functions) | 로그인, 사용자별 데이터, 서버리스 API, 결과 저장 |
| AI | Gemini API, OpenAI API | 개념 활용 사례 생성, 직무별 로드맵 생성 |
| 배포 · 협업 | Vercel, Figma, Git, GitHub | 서비스 배포, UI 설계, 버전 관리 |

**구현하면서 신경 쓴 점**
- 🔒 AI API는 브라우저에서 직접 부르지 않고 Supabase Edge Function에서만 호출합니다.
- 🛡 수강 상태, 관심 직무 같은 사용자별 데이터는 RLS로 본인만 접근하게 했습니다.
- ♻️ 같은 개념 조합의 AI 분석 결과는 DB에 저장해 두고 다시 씁니다.
- 📊 AI 로드맵 생성에는 사용 횟수 제한을 두었습니다.

---

## 📁 폴더 구조

```
Class2Career
├── frontend/              # React + Vite 웹 앱
│   ├── src/               # 페이지, 컴포넌트
│   │   └── roadmap/       # 로드맵, 공모전 화면
│   ├── api/               # 서버리스 API (개발 행사 피드)
│   └── tests/             # 테스트
└── supabase/
    ├── migrations/        # DB 스키마
    ├── functions/
    │   ├── generate-concept-examples/   # 개념별 활용 사례 생성
    │   └── generate-roadmap/            # 직무별 로드맵 생성
    └── seed-*.sql         # 과목, 개념, 직무 데이터
```

---

## 🌱 앞으로 하고 싶은 것

- 📚 매 학기 교과목을 업데이트하고 직무 데이터 늘리기
- 💬 현업 사례를 더 풍부하고 정확하게 제공하기
- ✅ 외부 사이트와 연동해 공모전을 찾아 정리하고, 지금 할 일을 체크리스트로 관리하기

한 번 보고 끝나는 서비스가 아니라, 계속 쓰면서 진로를 설계하는 도구로 키워 가고 싶습니다.

---

## 👥 팀원 — 컴작귀

| 이름 | 역할 |
| --- | --- |
| 강예은 | 프론트엔드 · 백엔드 |
| 국미승 | 백엔드 |
| 김경민 | 프론트엔드 |
| 박솔 | 백엔드 |
| 하가연 | 디자인 · 프론트엔드 |

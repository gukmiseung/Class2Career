# 직무별 AI 학습 로드맵

직무 탐색에서 직무와 **로드맵 확인하기**를 선택하고 로그인하면 **AI 로드맵 생성**을 사용할 수 있습니다. 함수는 현재 프로젝트에서 세션을 검증하고 선택한 직무의 교과목과 로그인 계정의 수강 이력을 조회합니다. OpenAI에는 직무, 교과목, 수강 상태 및 개념 비교 결과를 전달합니다. 추천 과목은 카탈로그에 연결된 미완료 과목으로 제한합니다.

## 배포

1. 프론트엔드의 `VITE_SUPABASE_URL`이 가리키는 프로젝트의 Edge Function Secrets에서 `OPENAI_API_KEY`를 확인합니다. 기본 모델은 `gpt-5.4-nano`이며 `ROADMAP_AI_MODEL`로 변경할 수 있습니다. `ROADMAP_ALLOWED_USER_IDS`가 설정되면 지정된 계정에만 기능이 열립니다.
2. 저장소 루트에서 함수를 배포합니다. 운영 프로젝트 ID는 `bnjskjmikxsrwpedmnvh`입니다.

   ```sh
   supabase functions deploy generate-roadmap --project-ref bnjskjmikxsrwpedmnvh --use-api
   ```

3. 로그인한 앱에서 직무를 하나 선택하고 **AI 로드맵 생성**을 눌러 학습 단계가 표시되는지 확인합니다. `ROADMAP_AI_MODE=mock`은 허용 계정이 필요한 개발용 설정입니다.

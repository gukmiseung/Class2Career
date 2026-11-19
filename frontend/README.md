# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Supabase 교과목 목록 연결

`frontend/.env.local`에 프로젝트의 URL과 Publishable key를 넣고 개발 서버를 다시 시작합니다.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Supabase에는 과목 검색 RPC `c2c_search_knu_courses`, 과목·개념·교육과정 테이블과 공개 SELECT 정책이 적용돼 있어야 합니다. 두 환경변수를 생략하면 기존 샘플 화면을 사용할 수 있습니다.

홈의 **내 전공 탐색하기**에서 과목명과 학수번호로 검색할 수 있습니다. 예를 들어 `COME0331`을 검색하고 **자료구조**를 누르면 과목 상세와 전공별 권장 시점을 확인할 수 있습니다.

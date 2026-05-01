# 주간 학습 플래너

## 프로젝트 개요

온라인 교육 플랫폼의 주간 학습 플래너 과제 구현입니다. 사용자는 월요일부터 일요일까지의 시간표에서 학습 블록을 추가, 수정, 삭제하고, 편집한 주간 스케줄을 한 번에 저장할 수 있습니다.

단순 화면 구현보다 서버 상태와 편집 중 상태의 분리, 시간 기반 도메인 로직의 분리, 저장 실패 시 draft 보존, Mock API의 실제 API 유사 동작을 우선했습니다.

주요 기능은 다음과 같습니다.

- 주간 학습 플래너 조회
- 월요일부터 일요일까지의 7일 시간표 표시
- `08:00~20:00` 범위의 30분 단위 슬롯 지원
- 빈 슬롯 클릭을 통한 학습 블록 추가
- 기존 학습 블록 클릭을 통한 수정 및 삭제
- 블록 삭제 전 확인 절차 제공
- 강의별 색상 구분
- 총 학습 시간, 강의별 학습 시간, 요일별 학습 시간 요약
- 편집 중인 draft 기준 실시간 요약 계산
- 시간 충돌 검증 및 충돌 블록 시각적 표시
- 저장 전 draft 상태와 서버 조회 상태 분리
- 저장 실패 시 편집 내용 유지
- 저장 중 중복 제출 방지
- 로딩, 에러, 빈 상태 처리
- 미저장 변경사항이 있을 때 주간 이동, 새로고침, 페이지 이탈 전 확인
- 데스크톱 7일 그리드, 모바일/태블릿 일별 select 뷰

## 기술 스택

- Vite
- React
- TypeScript
- TanStack Query
- Zustand
- React Hook Form
- Zod
- MSW
- Tailwind CSS
- Vitest
- lucide-react

## 실행 방법

### Docker Compose 실행

제출 검토 기준 실행 방법입니다.

```bash
docker compose up --build
```

브라우저에서 아래 주소로 접속해 확인하실 수 있습니다.

```txt
http://localhost:5173
```

초기 빌드 이후 코드만 수정하는 경우에는 다음 명령으로 실행해도 됩니다.

```bash
docker compose up
```

현재 Docker Compose는 `src`, `public`, Vite/TypeScript/ESLint 설정 파일을 bind mount합니다. 따라서 소스 코드와 설정 파일 변경은 Vite HMR로 바로 확인할 수 있습니다. `package.json` 또는 `pnpm-lock.yaml` 등 의존성 변경이 필요한 경우에는 이미지를 다시 빌드해야 합니다.

### 로컬 실행

Node.js 24(LTS)와 pnpm을 사용합니다. `.nvmrc`에는 `24.13.0`을 명시했습니다.

```bash
nvm use
corepack enable
pnpm install
pnpm dev
```

검증 명령은 다음과 같습니다.

```bash
pnpm lint
pnpm test
pnpm build
```

Docker 환경에서도 동일하게 검증할 수 있습니다.

```bash
docker compose run --rm app pnpm lint
docker compose run --rm app pnpm test
docker compose run --rm app pnpm build
```

현재 검증 결과는 다음과 같습니다.

```txt
Test Files  6 passed
Tests       22 passed
```

## 프로젝트 구조 설명

과제 규모에 맞춰 Feature-Sliced Design을 단순화한 레이어 구조를 사용했습니다.

```txt
src/
  app/
    providers/
    test/
  pages/
    planner-page/
  widgets/
    planner-shell/
    planner-summary/
    weekly-planner-grid/
  features/
    change-planner-week/
    planner-save/
    study-block-editor/
  entities/
    course/
    planner/
  shared/
    api/
    constants/
    lib/
    ui/
  mocks/
    data/
    handlers.ts
    browser.ts
    mock-policy.ts
```

레이어별 책임은 다음과 같습니다.

- `app`: 앱 진입점, provider 조립, 테스트 설정
- `pages`: 화면 단위 조립과 페이지 상태 연결
- `widgets`: 여러 feature와 entity를 조합하는 화면 영역
- `features`: 저장, 주간 이동, 블록 편집처럼 사용자 행위 중심 기능
- `entities`: 강의와 플래너 도메인의 타입, API, query, 순수 함수, 도메인 UI
- `shared`: 공통 API 클라이언트, 전역 상수, UI 컴포넌트, 유틸
- `mocks`: MSW handler와 mock data

과제 규모에 비해 과도한 public API barrel이나 레이어를 추가하지 않고, 파일의 책임이 보이는 단위로만 분리했습니다.

## 요구사항 해석 및 가정

### 요일 정책

본 구현에서는 과제 명세에 따라 `dayOfWeek`를 `0=월요일`, `6=일요일`로 해석했습니다.

이는 JavaScript `Date.getDay()`의 `0=일요일` 기준과 다릅니다. 그래서 주 시작일 계산과 요일 변환은 `src/entities/planner/model/week.ts`에 별도 함수로 분리했습니다.

### 시간 범위와 단위

- 플래너 시간 범위는 `08:00~20:00`입니다.
- 시간 선택은 30분 단위입니다.
- 종료 시간은 시작 시간보다 늦어야 합니다.
- `09:15`처럼 30분 단위에 맞지 않는 시간은 유효하지 않습니다.
- 메모는 공백 포함 200자 이하입니다.

관련 정책값은 `src/entities/planner/model/constants.ts`에 모았습니다.

### 시간 충돌 기준

시간 구간은 반열린 구간 `[start, end)`로 판단합니다.

- `10:00~11:00`과 `11:00~12:00`은 충돌하지 않습니다.
- `10:00~11:00`과 `10:30~11:30`은 충돌합니다.
- 충돌은 같은 요일 안에서만 검사합니다.

충돌 검증은 UI 컴포넌트가 아니라 `src/entities/planner/model/validation.ts`와 `src/entities/planner/model/draft-validation.ts`에 순수 함수로 분리했습니다.

### 반응형 정책

- 데스크톱: 월요일부터 일요일까지 7일 주간 그리드를 표시합니다.
- 태블릿/모바일: select로 요일을 선택하고 해당 요일 컬럼만 표시합니다.
- 월간 뷰는 과제 범위 밖으로 판단해 구현하지 않았습니다.
- 좁은 화면에서도 시간축, 요일, 강의명, 시간이 읽히도록 최소 폭과 텍스트 축약을 적용했습니다.

### 미저장 변경사항 확인

앱 내부에서 발생하는 주간 이동, 모달 닫기, 블록 삭제에는 확인 절차를 둡니다. 새로고침, 탭 닫기처럼 브라우저 레벨의 이탈은 보안 정책상 커스텀 모달을 사용할 수 없으므로 `beforeunload` 기반 브라우저 기본 경고를 사용합니다.

## 설계 결정과 이유

### 상태 관리 전략

서버 상태, 편집 상태, 폼 상태를 분리했습니다.

- 서버 상태: TanStack Query
- 편집 중 draft 상태: Zustand
- 폼 입력 상태: React Hook Form
- 폼 검증: Zod

서버에서 조회한 주간 플래너 데이터는 TanStack Query cache에 보관합니다. 사용자가 블록을 추가, 수정, 삭제하면 서버에 즉시 저장하지 않고 Zustand draft store에 먼저 반영합니다.

저장 성공 시에는 서버 응답을 기준으로 query cache와 draft를 함께 갱신합니다. 신규 블록의 서버 id도 이 시점에 반영됩니다. 저장 실패 시에는 Zustand draft를 초기화하지 않기 때문에 사용자가 편집한 내용이 사라지지 않습니다.

모달 안에서 아직 draft에 반영하지 않은 입력값도 React Hook Form의 dirty 상태로 추적합니다. 따라서 작성 중 새로고침, 뒤로가기, 모달 닫기, 주간 이동을 시도하면 확인 절차를 거칩니다.

### API와 Mock API

컴포넌트에서는 API endpoint나 `fetch`를 직접 사용하지 않습니다.

- 공통 HTTP 클라이언트: `src/shared/api/http-client.ts`
- endpoint 상수: `src/shared/api/api-endpoints.ts`
- query key 상수: `src/shared/api/query-keys.ts`
- 강의 API: `src/entities/course/api/course-api.ts`
- 플래너 API: `src/entities/planner/api/planner-api.ts`
- query hook: 각 entity의 `model/queries.ts`

MSW는 개발 환경에서만 실행되며, 실제 API를 호출하는 것과 같은 경로로 동작합니다.

지원하는 Mock API는 다음과 같습니다.

- `GET /api/courses`
- `GET /api/planner?weekStart={YYYY-MM-DD}`
- `PUT /api/planner`

Mock API는 단순 JSON 반환만 하지 않고 다음 상황을 재현합니다.

- 정상 조회 및 저장
- 네트워크 지연
- 요청 형식 오류
- 시간 범위 검증 실패
- 시간 충돌
- 서버 오류 시나리오

네트워크 지연은 `MOCK_POLICY.RESPONSE_DELAY_MS = 450`으로 두었습니다. 너무 짧으면 로딩 상태 확인이 어렵고, 너무 길면 과제 검토 흐름을 방해하므로 사용자가 로딩을 인지할 수 있는 정도의 값으로 정했습니다.

### 폼 검증

블록 추가 및 수정 폼은 React Hook Form과 Zod를 사용했습니다.

- 필수값 검증: 강의, 요일, 시작 시간, 종료 시간
- 형식 검증: 시간 문자열 형식
- 범위 검증: 플래너 운영 시간, 종료 시간이 시작 시간보다 늦은지 여부
- 단위 검증: 30분 단위
- 길이 검증: 메모 200자 이하

스키마 수준에서 처리 가능한 검증은 `src/features/study-block-editor/model/study-block-form-schema.ts`에 선언했습니다. 전체 draft 상태가 필요한 시간 충돌 검증은 별도 도메인 함수로 분리해 폼 제출 시 호출합니다.

### 그리드 위치 계산

시간축 배경은 CSS Grid로 구성하고, 실제 학습 블록은 각 요일 컬럼 안에서 absolute positioning으로 배치했습니다.

`startTime`과 `endTime`을 분 단위로 변환한 뒤, `08:00` 기준 offset과 duration을 계산해 `top`과 `height` 비율로 변환합니다. 이 계산은 `src/entities/planner/model/layout.ts`에 분리했습니다.

### 에러 처리

API 에러 코드는 사용자 메시지와 분리했습니다.

- 에러 코드: `src/shared/api/error-codes.ts`
- 공통 에러 메시지: `src/shared/constants/messages.ts`
- 플래너 검증 메시지: `src/entities/planner/model/messages.ts`
- 저장 기능 메시지: `src/features/planner-save/model/messages.ts`

HTTP 응답 오류와 네트워크 오류는 `httpClient`에서 앱 내부 `ApiError`로 변환합니다. 화면에서는 `getApiErrorMessage`를 통해 사용자에게 보여줄 수 있는 메시지만 사용합니다.

저장 실패 시에는 에러 메시지를 표시하고 draft는 유지합니다. 저장 중에는 저장 버튼을 loading/disabled 상태로 두어 중복 제출을 막습니다.

### 상수화 기준

다음 값은 컴포넌트에 직접 흩어지지 않도록 분리했습니다.

- API endpoint
- query key
- API error code
- 공통 에러 메시지
- validation message
- 저장 UI 메시지
- 요일 라벨
- 시간 범위
- 슬롯 단위
- 메모 길이 제한
- Mock API 지연 정책

전역에 가까운 값은 `shared`에 두고, 플래너 도메인 전용 값은 `entities/planner`, 저장 기능 전용 문구는 `features/planner-save`에 두었습니다.

### 100개 이상 블록에 대한 고려

현재 범위는 하루 `08:00~20:00`, 30분 단위이므로 하루 슬롯은 24개, 일주일 슬롯은 168개입니다. 충돌이 없는 30분 블록만으로 채우면 이론상 최대 168개 수준입니다.

따라서 100개 블록은 과제 범위에서는 과도한 렌더링 규모가 아니라고 판단했습니다. 다만 다음 기준을 적용했습니다.

- 블록을 요일별로 그룹화한 뒤 해당 요일 컬럼에서만 렌더링합니다.
- 강의 정보는 `courseId`로 매번 배열 탐색하지 않고 `courseMap`으로 조회합니다.
- 충돌 검증은 요일과 시작 시간 기준 정렬 후 필요한 범위만 비교합니다.
- 요약 계산은 draft blocks 변경을 기준으로 수행됩니다.

실제 제품에서 블록 수가 훨씬 증가한다면 서버 분할 조회, 시간 범위 필터링, 일별 뷰 강화, canvas 기반 렌더링 등을 우선 검토하겠습니다.

### 접근성과 UX

- 클릭 가능한 요소는 `button`을 사용했습니다.
- label과 입력 요소를 연결했습니다.
- 모달은 `role="dialog"`와 `aria-modal`을 사용했습니다.
- 버튼의 disabled, loading, hover, focus-visible 상태를 처리했습니다.
- 로딩, 에러, 빈 상태를 별도 UI로 표시했습니다.
- 메모 입력에는 현재 글자 수와 최대 글자 수를 표시했습니다.
- 저장/변경 취소 액션은 플래너 그리드 바로 위에 배치해 편집 대상과의 거리를 줄였습니다.
- 블록 삭제는 확인 절차 후 draft에서만 반영되며, 최종 서버 반영은 저장 버튼에서 수행됩니다.

### 테스트

도메인 순수 함수 중심으로 단위 테스트를 작성했습니다.

테스트 대상:

- 시간 문자열과 분 단위 변환
- 시간 범위와 30분 단위 검증
- 충돌 경계값 검증
- 주간 요약 계산
- 그리드 위치 계산
- draft 충돌 검증
- 주 시작일 계산

## 미구현 / 제약사항

- 드래그 앤 드롭은 구현하지 않았습니다. 과제 핵심인 상태 분리, 시간 검증, 저장 흐름의 안정성을 우선했습니다.
- 월간 뷰는 구현하지 않았습니다. 과제 요구사항을 주간 학습 플래너로 해석했습니다.
- 차트 라이브러리는 사용하지 않았습니다. 주간 요약은 카드와 리스트 형태로 충분히 읽을 수 있다고 판단했습니다.
- 토스트 라이브러리는 추가하지 않았습니다. 저장 실패와 dirty 상태는 inline feedback으로 노출해 의존성을 줄였습니다.
- Mock API는 브라우저 개발 환경의 MSW로 구성했습니다. 별도 백엔드 서버를 두는 것보다 프론트엔드 과제의 검토 흐름에 적합하다고 판단했습니다.
- Docker 개발 환경은 `node_modules`를 bind mount하지 않습니다. 의존성 변경 시 이미지를 다시 빌드하고, 코드 변경은 bind mount와 HMR로 확인하는 정책을 선택했습니다.
- 저장 성공/실패 플로우에 대한 React Testing Library 기반 통합 테스트는 추가하지 못했습니다. 대신 시간 계산, 충돌 검증, 요약 계산처럼 요구사항의 핵심이 되는 도메인 순수 함수 테스트를 우선했습니다.
- 서버 응답에 대한 런타임 Zod 검증은 적용하지 않았습니다. 현재는 TypeScript 타입과 MSW Mock API 계약을 기준으로 구현했습니다.

## AI 활용 범위

AI는 프로젝트 초기 구조 설계, 단순화한 FSD 레이어 구조 초안, 일부 UI 마크업 작성, README 초안 정리에 활용했습니다.

다만 시간 충돌 기준, 서버 상태와 draft 상태 분리 방식, 저장 실패 시 draft 유지 정책, MSW Mock API의 에러 응답 정책, 30분 단위 시간 검증 기준은 과제 요구사항을 바탕으로 직접 검토해 확정했습니다.

AI가 생성한 코드는 그대로 사용하지 않고, TypeScript 타입, 도메인 순수 함수, 테스트 결과, lint/build 결과를 기준으로 수정했습니다.

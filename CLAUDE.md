# Full-Stack Learning Project

## 나의 상황

- **역할**: FE 전문가 (BE 경험 ~1년)
- **목표**: NestJS + MikroORM 학습하여 풀스택으로 확장
- **학습 방식**: 회사 백엔드 코드 패턴을 따라가며 구현

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js (Page Router), React 19, TailwindCSS |
| Backend | NestJS, MikroORM (예정), MySQL |
| Infra | pnpm workspace, Turborepo, Biome, Docker |

## 프로젝트 구조

```
apps/
├── web/          # Next.js 프론트엔드 (localhost:3000)
└── api/          # NestJS 백엔드 (localhost:4000)
packages/
└── types/        # 공유 타입 (나중에 사용 예정)
```

## 학습 진행 상황

### 완료
- [x] Monorepo 환경 세팅 (pnpm workspace + Turborepo)
- [x] Next.js (Page Router) 설정
- [x] NestJS 기본 설정
- [x] Biome 설정 (ESLint/Prettier 대체)
- [x] pnpm catalog으로 공통 패키지 버전 관리

### 진행 중
- [ ] TypeORM → MikroORM 변경
- [ ] DB 연결 (Docker MySQL)

### 예정
- [ ] 첫 번째 CRUD API 구현
- [ ] Repository 패턴 학습
- [ ] Entity 설계

## 알고 있는 것 / 학습 필요

### 알고 있음 (FE 관점에서 이해)
- Controller: 라우팅 담당 (React Router와 유사)
- Module: 의존성 그룹화 (React Context Provider와 유사)
- 데코레이터: 메타데이터 추가 (@Get, @Post 등)

### 학습 필요
- Service와 Repository 분리 이유
- MikroORM의 flush() 개념
- Entity 관계 설정 (1:N, N:M)
- QueryBuilder 사용법
- 트랜잭션 처리

## 참고 자료

- `.ai/api/conventions/` - 회사 백엔드 코드 기반 컨벤션
  - `nestjs-mikroorm-context.md` - 아키텍처 규칙
  - `nestjs-mikroorm-snippets.md` - 코드 템플릿
  - `learning-prompts.md` - 단계별 학습 프롬프트

## AI 활용 가이드

### 학습할 때
```
/learn [개념] - FE 관점에서 비유해서 설명해줘
/explain [코드] - 이 코드가 뭘 하는지 설명해줘
```

### 구현할 때
```
/architecture [기능] - 구조 설계해줘
/review [코드] - 코드 리뷰해줘
```

### 세션 마무리할 때
```
/organization - 오늘 작업 내용 정리하고 CLAUDE.md 업데이트
```

## Response Style

- 한국어로 응답
- FE 개념과 비유해서 설명
- 코드 예시는 회사 컨벤션 따르기
- 한 번에 하나씩, 깊게

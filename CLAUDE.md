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
- [x] Docker MySQL 설정 (docker-compose.yml)
- [x] Todo CRUD API 구현 (TypeORM 사용)
- [x] AI 학습 자료 구성 (`.ai/api/` 폴더)
- [x] Auth 모듈 구현 (회원가입, 로그인, JWT)
- [x] Guard 및 Decorator 구현 (JwtAuthGuard, RolesGuard, @Roles, @CurrentUser)
- [x] Todo API에 인증/인가 적용

### 진행 중
- [ ] TypeORM → MikroORM 변경

### 예정
- [ ] MikroORM으로 Todo 모듈 마이그레이션
- [ ] Repository 패턴 적용
- [ ] Entity 관계 설정 학습

## 알고 있는 것 / 학습 필요

### 알고 있음
- Controller: 라우팅 담당
- Module: 의존성 그룹화
- 데코레이터: 메타데이터 추가 (@Get, @Post 등)
- Guard: 요청 허용/차단 (CanActivate 인터페이스)
- SetMetadata: 메타데이터 저장 (Guard가 Reflector로 읽음)
- createParamDecorator: 파라미터에 값 주입
- 데코레이터 실행 순서: 컴파일 타임(메타데이터 저장) → 런타임(Guard 실행)

### 학습 필요
- Service와 Repository 분리 이유
- MikroORM의 flush() 개념
- Entity 관계 설정 (1:N, N:M)
- QueryBuilder 사용법
- 트랜잭션 처리

## 참고 자료

- `.ai/api/` - AI 컨텍스트 및 학습 자료
  - `LEARNING.md` - 레이어 아키텍처, NestJS 개념, 코드 패턴 정리
  - `NESTJS-GUIDE.md` - NestJS 가이드
  - `AUTH-GUARD-DECORATOR.md` - Guard, Decorator, 인증/인가 시스템 정리
  - `prompts/` - 학습용 프롬프트 모음
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

## Learning Resources

프로젝트 학습 및 AI 컨텍스트 자료는 `.ai/api/` 폴더 참조:

- `.ai/api/LEARNING.md` - 레이어 아키텍처, NestJS 개념, 코드 패턴 정리
- `.ai/api/prompts/` - 단계별 학습용 프롬프트 모음

---

## 현재 세션 컨텍스트

> 마지막 업데이트: 2025-12-31

### 현재 상태

**Auth 모듈** (`apps/api/src/auth/`)
- `auth.controller.ts` - 회원가입, 로그인, 토큰 갱신 API
- `auth.service.ts` - JWT 토큰 생성/검증 로직
- `guards/jwt-auth.guard.ts` - 토큰 검증 Guard
- `guards/roles.guard.ts` - 역할 기반 접근 제어 Guard
- `decorators/roles.decorator.ts` - @Roles() 메타데이터 저장
- `decorators/current-user.decorator.ts` - @CurrentUser() 파라미터 주입

**User 모듈** (`apps/api/src/user/`)
- `user.entity.ts` - UserRole enum (USER, ADMIN) 포함
- `user.service.ts` - 메모리 기반 사용자 저장소

**Todo 모듈** (`apps/api/src/todo/`)
- 인증 적용됨 (JwtAuthGuard, RolesGuard)
- DELETE는 admin만 가능

**설정 파일:**
- `docker-compose.yml` - MySQL 8.0 (fullstack / fullstack123)

### 다음 작업

1. **TypeORM → MikroORM 마이그레이션**
   - MikroORM 패키지 설치
   - Entity를 MikroORM 문법으로 변경
   - Repository 패턴 적용

2. **Express Request 타입 확장**
   - `types/express.d.ts` 추가하여 `request.user` 타입 지정

### 최근 커밋

```
16d6b51 docs: NestJS 인증 및 권한 가이드 문서 추가
69d3e00 feat: JWT 인증 및 역할 기반 접근 제어 추가
68dc261 feat: 사용자 역할 추가 및 초기 사용자 데이터 설정
1a4a395 feat: 토큰 갱신 기능 추가
ad8b05a feat: JWT 인증 기능 추가
c5370d5 feat: 인증 모듈 추가
```

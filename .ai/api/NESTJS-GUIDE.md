# NestJS 가이드 (FE 개발자용)

FE 개발자가 NestJS를 이해하기 위한 가이드. React 개념과 비교하며 설명.

---

## 1. 전체 구조 이해

### NestJS vs React 비교

```
React App                      NestJS App
────────────────────────────────────────────
index.tsx (진입점)         →   main.ts (진입점)
App.tsx (루트 컴포넌트)     →   AppModule (루트 모듈)
Router (라우팅)            →   Controller (라우팅)
Context/Hook (상태/로직)   →   Service (비즈니스 로직)
fetch/axios (API 호출)     →   Repository (DB 접근)
interface (타입)           →   Entity (테이블 매핑)
Props 타입                 →   DTO (입출력 타입)
```

### 요청 흐름

```
HTTP 요청 (GET /todos)
    ↓
main.ts (서버가 요청 받음)
    ↓
AppModule (라우팅 찾기)
    ↓
Controller (@Get('todos') 매칭)
    ↓
Service (비즈니스 로직 실행)
    ↓
Repository (DB 조회) - 나중에 추가
    ↓
응답 반환
```

---

## 2. 핵심 구성 요소

### 2.1 main.ts - 앱 진입점

```typescript
// React의 index.tsx와 동일한 역할
async function bootstrap() {
  const app = await NestFactory.create(AppModule);  // createRoot()와 유사
  await app.listen(4000);  // 서버 시작
}
bootstrap();
```

**React 비유**:
```tsx
ReactDOM.createRoot(document.getElementById('root')).render(<App />)
```

### 2.2 Module - 의존성 그룹화

```typescript
@Module({
  imports: [OtherModule],     // 다른 모듈 가져오기
  controllers: [Controller],  // 라우팅 담당
  providers: [Service],       // 비즈니스 로직
  exports: [Service],         // 외부에 공개
})
export class SomeModule {}
```

**React 비유**:
```tsx
// 여러 Provider를 조합하는 것과 유사
<QueryClientProvider>
  <AuthProvider>
    <RouterProvider />
  </AuthProvider>
</QueryClientProvider>
```

**Module 옵션 설명**:

| 옵션 | 역할 | 비유 |
|------|------|------|
| `imports` | 다른 모듈 가져오기 | import 문 |
| `controllers` | HTTP 요청 처리 | Route 컴포넌트 |
| `providers` | 서비스/로직 등록 | Context Provider |
| `exports` | 다른 모듈에 공개 | export 문 |

### 2.3 Controller - HTTP 라우팅

```typescript
@Controller('todos')  // 기본 경로: /todos
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()              // GET /todos
  findAll() {}

  @Get(':id')         // GET /todos/123
  findOne(@Param('id') id: string) {}

  @Post()             // POST /todos
  create(@Body() dto: CreateTodoDto) {}

  @Patch(':id')       // PATCH /todos/123
  update(@Param('id') id: string, @Body() dto: UpdateTodoDto) {}

  @Delete(':id')      // DELETE /todos/123
  remove(@Param('id') id: string) {}
}
```

**React Router 비유**:
```tsx
<Route path="/todos" element={<TodoList />} />
<Route path="/todos/:id" element={<TodoDetail />} />
```

**파라미터 데코레이터**:

| NestJS | HTTP | React 비유 |
|--------|------|-----------|
| `@Param('id')` | /todos/:id | useParams() |
| `@Query('name')` | ?name=xxx | useSearchParams() |
| `@Body()` | request body | form data |
| `@Headers('token')` | 헤더 값 | - |

### 2.4 Service - 비즈니스 로직

```typescript
@Injectable()  // DI 가능하게 표시
export class TodoService {
  private todos = [];  // mock 데이터

  findAll() {
    return this.todos;
  }

  findOne(id: number) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    return todo;
  }

  create(dto: CreateTodoDto) {
    const todo = { id: Date.now(), ...dto };
    this.todos.push(todo);
    return todo;
  }
}
```

**React Custom Hook 비유**:
```tsx
const useTodos = () => {
  const [todos, setTodos] = useState([]);

  const findAll = () => todos;
  const create = (dto) => setTodos([...todos, { id: Date.now(), ...dto }]);

  return { findAll, create };
};
```

### 2.5 DTO - 데이터 전송 객체

```typescript
// Request DTO (입력)
export class CreateTodoDto {
  title: string;
  description?: string;
}

// Response DTO (출력) - 선택사항
export class TodoResponseDto {
  id: number;
  title: string;
  completed: boolean;
}
```

**React Props 타입 비유**:
```tsx
interface TodoProps {
  title: string;
  description?: string;
}
```

---

## 3. 의존성 주입 (DI)

### 핵심 개념

NestJS가 자동으로 인스턴스를 생성하고 주입해줌.

```typescript
// NestJS - 자동 주입
@Controller()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}
  //          ↑ NestJS가 TodoService 인스턴스를 알아서 넣어줌
}
```

**React Context 비유**:
```tsx
// React - useContext로 가져옴
const MyComponent = () => {
  const todoService = useContext(TodoContext);
};
```

### 왜 DI를 쓰나?

| 이점 | 설명 |
|------|------|
| 테스트 용이 | 가짜(mock) 서비스로 교체 가능 |
| 느슨한 결합 | 구현체 변경 시 사용처 수정 불필요 |
| 싱글톤 관리 | 메모리 효율적 |

---

## 4. 데코레이터 (@)

### 데코레이터란?

클래스나 메서드에 메타데이터를 추가하는 문법.

```typescript
@Controller()   // "이 클래스는 컨트롤러야"
@Injectable()   // "이 클래스는 주입 가능해"
@Get()          // "이 메서드는 GET 요청 처리해"
@Module()       // "이 클래스는 모듈이야"
```

**React HOC 비유**:
```tsx
// HOC로 기능 추가
export default withAuth(MyComponent);

// 데코레이터로 기능 추가
@Controller()
export class MyController {}
```

### 주요 데코레이터

| 데코레이터 | 용도 |
|-----------|------|
| `@Module()` | 모듈 정의 |
| `@Controller()` | 컨트롤러 정의 |
| `@Injectable()` | 서비스/프로바이더 정의 |
| `@Get()`, `@Post()` 등 | HTTP 메서드 |
| `@Param()`, `@Body()`, `@Query()` | 파라미터 추출 |

---

## 5. 모듈 구조 패턴

### 5.1 기본 구조 (소규모)

```
src/
├── app.module.ts        # 루트 모듈
├── app.controller.ts    # 기본 컨트롤러 (health 등)
│
├── todo/                # 기능별 폴더
│   ├── todo.module.ts
│   ├── todo.controller.ts
│   ├── todo.service.ts
│   └── dto/
│       ├── create-todo.dto.ts
│       └── update-todo.dto.ts
│
└── user/
    ├── user.module.ts
    ├── user.controller.ts
    └── user.service.ts
```

### 5.2 레이어 구조 (대규모)

```
src/
├── app.module.ts
│
├── api-public/              # 공개 API (인증 불필요)
│   └── todo/
│       ├── todo.module.ts
│       ├── todo.controller.ts
│       └── todo.service.ts
│
├── api-admin/               # 관리자 API (인증 필요)
│   ├── user/
│   └── auth/
│
├── domain/                  # 비즈니스 로직 (여러 API에서 공유)
│   └── user/
│       └── user-domain.service.ts
│
└── core/                    # 공통 인프라
    ├── database/
    └── guards/
```

### 언제 어떤 구조?

| 구조 | 적합한 경우 |
|------|------------|
| **기본 구조** | 학습, 소규모 프로젝트, 기능 5개 이하 |
| **레이어 구조** | 대규모, 다중 API (public/admin), 팀 프로젝트 |

---

## 6. 레이어 아키텍처

### 레이어란?

소프트웨어를 책임별로 수평 분리한 구조.

```
[레스토랑 비유]
  홀 서빙     →  요청 받고 응답 전달  →  Controller
  주방        →  실제 요리            →  Service
  식자재 창고  →  재료 보관/조회       →  Repository
```

### 레이어별 역할

```
┌─────────────────────────────────┐
│  Controller (Presentation)       │  ← HTTP 요청/응답 처리
├─────────────────────────────────┤
│  Service (Business)              │  ← 비즈니스 로직
├─────────────────────────────────┤
│  Repository (Data)               │  ← DB 접근 (나중에 추가)
└─────────────────────────────────┘
```

### 핵심 규칙: 의존성 방향

**위 → 아래로만 의존**

```typescript
// ✅ OK: Controller → Service
@Controller()
class TodoController {
  constructor(private todoService: TodoService) {}
}

// ✅ OK: Service → Repository
@Injectable()
class TodoService {
  constructor(private todoRepository: TodoRepository) {}
}

// ❌ BAD: Service → Controller (역방향 금지)
class TodoService {
  constructor(private controller: TodoController) {} // 절대 금지
}
```

### 레이어 분리의 이점

| 이점 | 설명 |
|------|------|
| 테스트 용이 | 각 레이어 독립적으로 테스트 |
| 변경 격리 | DB 변경해도 Controller는 안 건드림 |
| 역할 명확 | "이 로직 어디 넣지?" 고민 감소 |
| 재사용성 | Service를 여러 Controller에서 공유 |

---

## 7. 에러 처리

### 내장 예외 클래스

```typescript
import {
  NotFoundException,      // 404
  BadRequestException,    // 400
  UnauthorizedException,  // 401
  ForbiddenException,     // 403
} from '@nestjs/common';

// 사용 예시
if (!todo) {
  throw new NotFoundException('Todo를 찾을 수 없습니다.');
}

if (!isValid) {
  throw new BadRequestException('잘못된 입력입니다.');
}
```

### 프론트에서 받는 응답

```json
{
  "statusCode": 404,
  "message": "Todo를 찾을 수 없습니다.",
  "error": "Not Found"
}
```

---

## 8. 파일 네이밍 컨벤션

| 파일 | 네이밍 | 예시 |
|------|--------|------|
| Module | `{feature}.module.ts` | `todo.module.ts` |
| Controller | `{feature}.controller.ts` | `todo.controller.ts` |
| Service | `{feature}.service.ts` | `todo.service.ts` |
| DTO | `{action}-{feature}.dto.ts` | `create-todo.dto.ts` |
| Entity | `{feature}.entity.ts` | `todo.entity.ts` (나중에) |

---

## 9. 학습 순서 추천

### Phase 1: 기본 패턴
1. Controller - 라우팅 이해
2. Service - 비즈니스 로직 분리
3. Module - 의존성 연결
4. DTO - 타입 정의

### Phase 2: 구조 확장
1. 여러 모듈 만들기 (Todo, User)
2. 레이어 분리 (api-public, api-admin)
3. 공유 로직 (domain)

### Phase 3: DB 연결 (나중에)
1. Entity 정의
2. Repository 패턴
3. MikroORM 쿼리

---

## 10. 요약

```
NestJS = Module + Controller + Service

Module    → 의존성 조합 (Provider 역할)
Controller → HTTP 라우팅 (Router 역할)
Service   → 비즈니스 로직 (Custom Hook 역할)
```

**기억할 것**:
- 위에서 아래로만 의존 (Controller → Service → Repository)
- 한 파일에 한 역할
- 데코레이터로 메타데이터 추가
- DI로 느슨한 결합

# NestJS Auth, Guard, Decorator 완벽 가이드

> FE 개발자를 위한 NestJS 인증/인가 시스템 설명

## 1. 전체 구조 (Big Picture)

```
요청 흐름:
Client → Guard(문지기) → Controller → Service
```

Auth 시스템 구성요소:
- **Guards**: 요청을 허용할지 막을지 결정하는 "문지기"
- **Decorators**: 메타데이터를 붙이는 "라벨 스티커"

---

## 2. Guard란?

### NestJS Guard

Guard는 **요청이 Controller에 도달하기 전에** 실행되는 검문소.

```
[요청] → [Guard: 통과? 차단?] → [Controller]
```

### CanActivate 인터페이스

```typescript
interface CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
```

- `canActivate()`: **true 반환하면 통과**, false나 예외 던지면 차단
- `ExecutionContext`: 현재 요청의 모든 정보를 담고 있는 객체

### @UseGuards로 Guard 적용

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
```

NestJS는 `CanActivate` 인터페이스를 구현한 클래스를 Guard로 인식한다.

---

## 3. JwtAuthGuard 분석

```typescript
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Request 객체 꺼내기
    const request = context.switchToHttp().getRequest<Request>();

    // 2. Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.authorization;
    const token = authHeader.replace('Bearer ', '');

    // 3. 토큰 검증
    const payload = this.jwtService.verify(token);

    // 4. 사용자 조회
    const user = this.userService.findById(payload.sub);

    // 5. request에 user 저장 (Controller에서 사용)
    (request as any).user = user;

    return true;
  }
}
```

### 핵심 포인트

**`context.switchToHttp().getRequest()`**
- NestJS는 HTTP 외에 WebSocket, GraphQL 등도 지원
- `switchToHttp()`로 HTTP 컨텍스트임을 명시
- FE 비유: `event.target`처럼 원하는 객체를 꺼내는 것

**`request.user = user`**
- 검증된 사용자 정보를 request에 저장
- 이후 Controller나 다른 Guard에서 접근 가능

### any 대신 타입 확장하기

```typescript
// types/express.d.ts
import { User } from '../user/user.entity';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
```

이렇게 하면 `(request as any).user` 대신 `request.user` 사용 가능.

---

## 4. RolesGuard 분석

```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. @Roles() 데코레이터에서 설정한 역할 가져오기
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    // 2. @Roles() 데코레이터가 없으면 통과
    if (!requiredRoles) return true;

    // 3. JwtAuthGuard에서 저장한 user 가져오기
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // 4. 권한 체크
    return requiredRoles.includes(user.role);
  }
}
```

---

## 5. Reflector란?

**메타데이터를 읽는 도구**.

```typescript
// 데코레이터로 메타데이터 "저장"
@Roles('admin')  // → { roles: ['admin'] } 저장됨

// Reflector로 메타데이터 "읽기"
this.reflector.getAllAndOverride('roles', [...])  // → ['admin'] 반환
```

---

## 6. 데코레이터 만들기

### 두 가지 데코레이터 타입

| 함수 | 용도 | 사용 시점 |
|------|------|----------|
| `SetMetadata(key, value)` | 메타데이터 저장 | Guard가 나중에 읽음 |
| `createParamDecorator(fn)` | 파라미터에 값 주입 | Controller에서 바로 사용 |

### 6-1. Roles 데코레이터 (SetMetadata)

```typescript
import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

**목적**: "이 엔드포인트는 특정 역할만 접근 가능" 정보를 저장

**사용법**:
```typescript
@Roles('admin', 'manager')
@Get('users')
getUsers() { ... }
```

### 6-2. CurrentUser 데코레이터 (createParamDecorator)

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);
```

**목적**: `request.user`를 편하게 꺼내기 위한 파라미터 데코레이터

**사용법**:
```typescript
@Get('profile')
getProfile(@CurrentUser() user: User) {
  return user;  // 바로 사용!
}
```

**왜 필요해?**
```typescript
// 매번 이렇게 하기 귀찮음
@Get()
getProfile(@Req() req: Request) {
  const user = req.user;
}

// 깔끔하게
@Get()
getProfile(@CurrentUser() user: User) { }
```

### 6-3. 형식이 다른 이유

| 데코레이터 | 목적 | 함수 |
|-----------|------|------|
| `@Roles()` | 메타데이터 **저장** | `SetMetadata` |
| `@CurrentUser()` | 값을 **주입** | `createParamDecorator` |

---

## 7. 실행 순서 (핵심!)

### 코드 작성 순서

```typescript
@Delete(':id')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
remove(@Param('id') id: string) { }
```

### 실제 실행 순서

**데코레이터는 두 가지 타이밍에 실행된다:**

```
┌─────────────────────────────────────────────────────────┐
│  컴파일 타임 (서버 시작 시)                               │
│  ─────────────────────────                              │
│  @Roles('admin') 실행 → 메타데이터 저장됨                 │
│  "이 메서드는 admin이 필요해" 정보가 미리 등록            │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  런타임 (요청이 들어올 때)                                │
│  ─────────────────────                                  │
│  1. JwtAuthGuard 실행 → 토큰 검증, request.user 저장     │
│  2. RolesGuard 실행 → 메타데이터 읽어서 권한 검증         │
│  3. Controller 메서드 실행                               │
└─────────────────────────────────────────────────────────┘
```

### 요청 흐름 예시

```
DELETE /todos/1 요청
    │
    ▼
JwtAuthGuard ──── 토큰 OK? ──── request.user = { id: 1, role: 'user' }
    │
    ▼
RolesGuard ────── 메타데이터 읽기: ['admin']
    │             user.role: 'user'
    │             'user' in ['admin']? → NO!
    ▼
ForbiddenException: 권한이 없습니다.
```

---

## 8. 실제 사용 예시

```typescript
@Controller('todo')
export class TodoController {

  // 로그인한 사용자만 접근
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@CurrentUser() user: User) {
    return this.todoService.findAll(user.id);
  }

  // admin만 접근 가능
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.todoService.remove(id);
  }
}
```

---

## 9. Module에서 exports

```typescript
@Module({
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
```

다른 모듈(예: TodoModule)에서 Guard를 사용하려면 export 필요.

---

## 10. 개념 요약

| 개념 | 역할 | FE 비유 |
|------|------|---------|
| **Guard** | 요청 허용/차단 결정 | Protected Route |
| **CanActivate** | Guard 인터페이스 | - |
| **ExecutionContext** | 요청 정보 컨테이너 | event 객체 |
| **Reflector** | 메타데이터 읽기 | localStorage.getItem |
| **SetMetadata** | 메타데이터 저장 | localStorage.setItem |
| **createParamDecorator** | 파라미터 데코레이터 생성 | Custom Hook |
| **@UseGuards** | Guard 적용 | HOC 적용 |

---

## 11. 파일 구조

```
auth/
├── guards/
│   ├── jwt-auth.guard.ts    # 토큰 검증
│   └── roles.guard.ts       # 역할 검증
├── decorators/
│   ├── roles.decorator.ts   # @Roles() - 메타데이터 저장
│   └── current-user.decorator.ts  # @CurrentUser() - 값 주입
├── auth.controller.ts
├── auth.service.ts
└── auth.module.ts
```

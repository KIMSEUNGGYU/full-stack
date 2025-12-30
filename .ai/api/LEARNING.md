# LEARNING.md

FE 개발자가 이 코드베이스로 NestJS + MikroORM 백엔드를 학습하기 위한 가이드.

---

## Layer Architecture (레이어 아키텍처)

### Layer란?

**소프트웨어를 책임별로 수평 분리한 구조**

```
[레스토랑 비유]
  홀 서빙    →  요청 받고 응답 전달  →  Presentation Layer
  주방       →  실제 요리            →  Business Layer
  식자재 창고 →  재료 보관/조회       →  Data Layer
```

각 역할이 분리되어 있고, **위에서 아래로만** 요청이 흐른다.

### 이 프로젝트의 레이어 구조

```
┌─────────────────────────────────┐
│  api-admin / api-public         │  ← Presentation Layer (요청/응답)
├─────────────────────────────────┤
│  domain                         │  ← Business Layer (비즈니스 규칙)
├─────────────────────────────────┤
│  modules                        │  ← Infrastructure Layer (외부 연동)
├─────────────────────────────────┤
│  core + entities                │  ← Data Layer (DB, 공통 인프라)
└─────────────────────────────────┘
```

### 디렉토리별 역할

| 디렉토리 | 레이어 | 역할 | 예시 |
|----------|--------|------|------|
| `api-admin/` | Presentation | 내부 관리자용 API | Retool에서 호출하는 API |
| `api-public/` | Presentation | 외부 공개 API | 파트너, 웹훅 |
| `domain/` | Business | 비즈니스 로직 서비스 | 주문 처리, 문서 만료 로직 |
| `modules/` | Infrastructure | 외부 연동 및 유틸리티 | Cafe24 API, S3, Slack |
| `core/` | Data/Common | 공통 인프라 | DB 설정, 보안, 로깅 |
| `batch/` | Application | 스케줄링/배치 작업 | 주문 동기화, 리포트 생성 |

### 핵심 규칙: 의존성 방향

**위 → 아래로만 의존**

```typescript
// ✅ OK: Controller → Service
@Controller()
class OrderController {
  constructor(private orderService: OrderService) {}
}

// ✅ OK: Service → Repository
@Injectable()
class OrderService {
  constructor(private orderRepository: OrderRepository) {}
}

// ❌ BAD: Service → Controller (역방향 금지)
class OrderService {
  constructor(private controller: OrderController) {} // 절대 금지
}
```

### 왜 레이어를 나누는가?

| 이점 | 설명 |
|------|------|
| **테스트 용이** | 각 레이어 독립적으로 테스트 가능 |
| **변경 격리** | DB 변경해도 Controller는 안 건드림 |
| **역할 명확** | "이 로직 어디 넣지?" 고민 감소 |
| **재사용성** | domain 로직을 admin/public API에서 공유 |

### 레이어별 코드 작성 가이드

```typescript
// 🎯 Presentation Layer (Controller)
// - HTTP 요청/응답 처리만
// - 비즈니스 로직 X
// - DTO 변환
@Controller('order')
class OrderController {
  @Get(':id')
  async getOrder(@Param('id') id: number) {
    return this.orderService.findOne(id); // 로직은 Service에 위임
  }
}

// 🎯 Business Layer (Service)
// - 비즈니스 규칙 구현
// - 트랜잭션 관리
// - 여러 Repository 조합
@Injectable()
class OrderService {
  async createOrder(dto: CreateOrderDto) {
    // 비즈니스 검증
    if (!this.canCreateOrder(dto)) {
      throw new BadRequestException();
    }
    // Repository 호출
    return this.orderRepository.create(dto);
  }
}

// 🎯 Data Layer (Repository)
// - DB 접근만
// - 쿼리 로직
// - 비즈니스 로직 X
@Repository(OrderEntity)
class OrderRepository extends EntityRepository<OrderEntity> {
  async findByStatus(status: string) {
    return this.find({ status });
  }
}
```

### 아키텍처 선택 기준

| 구조 | 장점 | 단점 | 적합한 경우 |
|------|------|------|-------------|
| **레이어 기반** (현재) | 관심사 분리 명확, 의존성 통제 | 기능 추가 시 여러 폴더 수정 | 다중 진입점, 외부 연동 많음 |
| **기능(Feature) 기반** | 관련 코드 한 곳에 | 공유 코드 위치 애매 | 마이크로서비스, 모듈 독립성 |
| **혼합형** | 유연함 | 일관성 유지 어려움 | 레거시 + 신규 혼재 |

**이 프로젝트가 레이어 기반인 이유:**
- 다중 서비스 (admin-api, public-api, batch)
- 외부 연동 많음 (Cafe24, Naver, Slack 등)
- 공유 로직 많음 (domain 레이어에서 재사용)

---

## NestJS 핵심 개념 (FE 관점)

### 계층 구조 비교

| NestJS | React/FE | 역할 |
|--------|----------|------|
| Controller | Route + API handler | HTTP 요청 받아서 라우팅 |
| Service | Custom Hook 로직 | 비즈니스 로직 처리 |
| Repository | fetch 함수들 | 데이터 접근 (DB/API) |
| Entity | TypeScript interface | 데이터 구조 정의 |
| DTO | Props 타입 | 입출력 타입 정의 |
| Module | Context Provider | 의존성 연결 |

### 의존성 주입 (DI)

React의 Context와 비슷한 개념:

```typescript
// React Context
const service = useContext(ServiceContext);

// NestJS DI
constructor(private readonly userService: UserService) {}
```

## 학습 순서

### Level 1: 구조 이해

1. **Controller 읽기** - `src/api-admin/users/user.controller.ts`
   - `@Controller('user')` → 기본 경로 `/user`
   - `@Get('users')` → GET `/user/users`
   - `@Post('users')` → POST `/user/users`
   - `@Query()`, `@Body()`, `@Param()` → 파라미터 추출

2. **Service 읽기** - `src/api-admin/users/user.service.ts`
   - Repository 호출
   - 에러 처리 (`throw new NotFoundException()`)
   - 비즈니스 로직

3. **Repository 읽기** - `src/modules/entities/user/user.repository.ts`
   - `findOne()`, `find()`, `create()`
   - `flush()` → 실제 DB 반영 (React의 setState 후 렌더링과 유사)

4. **Entity 읽기** - `src/modules/entities/user/user.entity.ts`
   - `@Entity()` → 테이블 매핑
   - `@Property()` → 컬럼 매핑
   - `@PrimaryKey()` → PK

### Level 2: CRUD 패턴

```typescript
// CREATE
async create(dto: CreateDto) {
  const entity = this.repository.create(dto);
  await this.repository.getEntityManager().flush();
  return entity;
}

// READ (단일)
async findOne(id: number) {
  return this.repository.findOne({ id });
}

// READ (목록)
async findAll(filter: FilterDto) {
  return this.repository.find(filter);
}

// UPDATE
async update(id: number, dto: UpdateDto) {
  const entity = await this.repository.findOne({ id });
  this.repository.assign(entity, dto);
  await this.repository.getEntityManager().flush();
}

// DELETE
async delete(id: number) {
  const entity = await this.repository.findOne({ id });
  await this.repository.getEntityManager().removeAndFlush(entity);
}
```

### Level 3: 관계 (Relations)

```typescript
// Entity에서 관계 정의
@OneToOne(() => ProfileEntity, profile => profile.user)
profile: ProfileEntity;

@OneToMany(() => PostEntity, post => post.author)
posts: PostEntity[];

// 조회 시 관계 로딩
await repository.findOne({ id }, { populate: ['profile', 'posts'] });
```

## 실습 예제

### 예제 1: 간단한 조회 API 따라가기

```
GET /user/users?team=Product
```

흐름:
1. `UserController.getUsers()` 호출
2. `@Query('team')` 으로 쿼리 파라미터 추출
3. `UserService.getUsers({ team })` 호출
4. `UserRepository.findAllBy({ team: { $like: '%Product%' } })` 실행
5. DB 결과 반환

### 예제 2: 생성 API 따라가기

```
POST /user/users
Body: { email: "test@test.com", team: "Dev", roles: [] }
```

흐름:
1. `UserController.createUser()` 호출
2. `@Body() dto: CreateUserRequestDto` 로 Body 파싱
3. `UserService.createUser({ dto })` 호출
4. 검증 로직 (관리자 확인, Slack 유저 확인)
5. `UserRepository.createIfNotExisted(user)` 실행
6. `flush()` → DB에 실제 저장

## MikroORM 쿼리 패턴

### 기본 조회

```typescript
// 단일 조회
await repo.findOne({ email: 'test@test.com' });

// 목록 조회
await repo.find({ status: 'active' });

// 조건 조회
await repo.find({
  roles: { $like: '%admin%' },
  createdAt: { $gte: new Date('2024-01-01') }
});
```

### QueryBuilder (복잡한 쿼리)

```typescript
await entityManager
  .createQueryBuilder(UserEntity, 'u')
  .select('*')
  .leftJoinAndSelect('u.profile', 'p')
  .where({ 'u.status': 'active' })
  .getResultList();
```

## 에러 처리 패턴

```typescript
import { NotFoundException, BadRequestException } from '@nestjs/common';

// 404 Not Found
if (!user) {
  throw new NotFoundException('유저를 찾을 수 없습니다.');
}

// 400 Bad Request
if (invalidInput) {
  throw new BadRequestException('잘못된 입력입니다.');
}

// 406 Not Acceptable
if (!hasPermission) {
  throw new NotAcceptableException('권한이 없습니다.');
}
```

## 참고 파일 경로

| 목적 | 파일 |
|------|------|
| 간단한 Controller | `src/api-admin/address/address.controller.ts` |
| CRUD Controller | `src/api-admin/users/user.controller.ts` |
| Service 패턴 | `src/api-admin/users/user.service.ts` |
| Repository 패턴 | `src/modules/entities/user/user.repository.ts` |
| Entity 정의 | `src/modules/entities/user/user.entity.ts` |
| DTO 정의 | `src/api-admin/users/dtos/create-user.request.dto.ts` |
| Module 정의 | `src/api-admin/users/user.module.ts` |

## 다음 단계

1. User 모듈 코드 전체 읽어보기
2. Swagger UI로 API 테스트 (`http://localhost:8081/docs`)
3. 간단한 API 하나 직접 추가해보기
4. Repository에 새 쿼리 메서드 추가해보기

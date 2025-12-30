# NestJS + MikroORM Context Prompt

이 프롬프트를 실제 적용할 레포의 CLAUDE.md 또는 별도 context 파일에 복사해서 사용.

---

## NestJS Architecture Rules

### Layer Structure

모든 API는 다음 계층을 따른다:

```
HTTP Request
    ↓
Controller (라우팅, 파라미터 파싱)
    ↓
Service (비즈니스 로직, 검증, 트랜잭션)
    ↓
Repository (DB 쿼리)
    ↓
Entity (테이블 매핑)
```

### Naming Conventions

| 파일 | 네이밍 | 예시 |
|------|--------|------|
| Controller | `{feature}.controller.ts` | `user.controller.ts` |
| Service | `{feature}.service.ts` | `user.service.ts` |
| Module | `{feature}.module.ts` | `user.module.ts` |
| Entity | `{entity}.entity.ts` | `user.entity.ts` |
| Repository | `{entity}.repository.ts` | `user.repository.ts` |
| DTO | `{action}-{entity}.dto.ts` | `create-user.dto.ts` |

### Directory Structure

```
src/
├── api-{type}/              # API 계층 (admin, public 등)
│   └── {feature}/
│       ├── {feature}.module.ts
│       ├── {feature}.controller.ts
│       ├── {feature}.service.ts
│       └── dtos/
│           ├── {action}.request.dto.ts
│           └── {action}.response.dto.ts
│
├── domain/                  # 도메인 로직 (여러 API에서 공유)
│   └── {domain}/
│       └── {domain}.service.ts
│
├── modules/
│   └── entities/           # DB 엔티티
│       └── {domain}/
│           ├── {entity}.entity.ts
│           ├── {entity}.repository.ts
│           └── {entity}-repository.module.ts
│
└── core/                   # 인프라 (DB, HTTP, 보안 등)
```

## MikroORM Rules

### Entity Definition

```typescript
@Entity({ tableName: 'table_name' })
export class SomeEntity {
  @PrimaryKey()
  id?: number;

  @Property({ name: 'db_column_name' })  // snake_case → camelCase 매핑
  propertyName: string;

  @Property({ type: 'json' })
  jsonField: SomeType[];

  @Property({ defaultRaw: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;
}
```

### Repository Pattern

```typescript
@Injectable()
export class SomeRepository {
  constructor(
    @InjectRepository(SomeEntity, CONNECTION_NAME)
    private readonly repository: EntityRepository<SomeEntity>,
    @InjectEntityManager(CONNECTION_NAME)
    private readonly em: EntityManager
  ) {}

  // 조회는 repository 사용
  async findById(id: number) {
    return this.repository.findOne({ id });
  }

  // 복잡한 쿼리는 QueryBuilder
  async findWithRelations() {
    return this.em
      .createQueryBuilder(SomeEntity, 'e')
      .leftJoinAndSelect('e.relation', 'r')
      .getResultList();
  }

  // 생성/수정 후 반드시 flush()
  async create(data: CreateDto) {
    const entity = this.repository.create(data);
    await this.em.flush();
    return entity;
  }
}
```

### Important: flush() Rule

- `create()`, `assign()` 후 반드시 `flush()` 호출
- `flush()`가 실제 DB에 반영하는 시점
- 트랜잭션이 필요하면 여러 작업 후 한 번에 `flush()`

## Controller Decorators

```typescript
@Controller('base-path')
export class SomeController {

  @Get('items')           // GET /base-path/items
  @Post('items')          // POST /base-path/items
  @Patch('items/:id')     // PATCH /base-path/items/123
  @Delete('items/:id')    // DELETE /base-path/items/123

  async method(
    @Query('param') param: string,      // ?param=value
    @Body() dto: SomeDto,               // Request body
    @Param('id') id: string,            // URL parameter
    @Headers('header') header: string   // Request header
  ) {}
}
```

## Error Handling

```typescript
import {
  NotFoundException,      // 404
  BadRequestException,    // 400
  NotAcceptableException, // 406
  UnauthorizedException,  // 401
  ForbiddenException      // 403
} from '@nestjs/common';

// 사용
if (!entity) {
  throw new NotFoundException('리소스를 찾을 수 없습니다.');
}
```

## Module Registration

```typescript
@Module({
  imports: [
    // 다른 모듈 (Repository 모듈 등)
    SomeRepositoryModule,
    OtherModule,
  ],
  controllers: [SomeController],
  providers: [SomeService],
  exports: [SomeService],  // 다른 모듈에서 사용 시
})
export class SomeModule {}
```

## Service Pattern

```typescript
@Injectable()
export class SomeService {
  constructor(
    private readonly someRepository: SomeRepository,
    private readonly otherService: OtherService,  // 다른 서비스 주입
  ) {}

  async doSomething(dto: SomeDto) {
    // 1. 검증
    const existing = await this.someRepository.findById(dto.id);
    if (!existing) {
      throw new NotFoundException('Not found');
    }

    // 2. 비즈니스 로직
    const result = this.processData(dto);

    // 3. 저장
    return this.someRepository.create(result);
  }
}
```

# NestJS + MikroORM Code Snippets

복사해서 바로 사용 가능한 코드 템플릿 모음.

---

## 1. Entity Template

```typescript
import { Entity, PrimaryKey, Property, Index, Unique } from '@mikro-orm/core';

@Entity({ tableName: 'table_name' })
export class FeatureEntity {
  @PrimaryKey({ name: 'id' })
  id?: number;

  @Property({
    name: 'name',
    type: 'varchar',
    length: 200,
    comment: '이름',
    nullable: false,
  })
  name: string;

  @Property({
    name: 'status',
    type: 'varchar',
    length: 50,
    comment: '상태',
    nullable: true,
  })
  @Index({ name: 'idx_status' })
  status?: string;

  @Property({
    name: 'email',
    type: 'varchar',
    length: 200,
  })
  @Unique({ name: 'idx_u_email' })
  email: string;

  @Property({
    name: 'metadata',
    type: 'json',
    comment: 'JSON 데이터',
    nullable: true,
  })
  metadata?: Record<string, unknown>;

  @Property({
    name: 'reg_ts',
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
  })
  regTs?: Date;

  @Property({
    name: 'upd_ts',
    type: 'timestamp',
    defaultRaw: 'CURRENT_TIMESTAMP',
    onUpdate: () => new Date(),
  })
  updTs?: Date;
}
```

---

## 2. Repository Template

```typescript
import { EntityRepository, FilterQuery } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { InjectEntityManager, InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { RW_CONNECTION } from '../connections';
import { FeatureEntity } from './feature.entity';

@Injectable()
export class FeatureRepository {
  constructor(
    @InjectRepository(FeatureEntity, RW_CONNECTION)
    private readonly repository: EntityRepository<FeatureEntity>,
    @InjectEntityManager(RW_CONNECTION)
    private readonly em: EntityManager
  ) {}

  // === 조회 ===

  async findById(id: number) {
    return this.repository.findOne({ id });
  }

  async findByCondition(condition: FilterQuery<FeatureEntity>) {
    return this.repository.find(condition);
  }

  async findAll() {
    return this.repository.findAll();
  }

  async count(condition: FilterQuery<FeatureEntity>) {
    return this.repository.count(condition);
  }

  // === 생성 ===

  async create(data: Partial<FeatureEntity>) {
    const entity = this.repository.create(data);
    await this.em.flush();
    return entity;
  }

  async createIfNotExists(uniqueField: string, data: Partial<FeatureEntity>) {
    const existing = await this.repository.findOne({ email: uniqueField } as FilterQuery<FeatureEntity>);

    if (existing) {
      return { entity: existing, isCreated: false };
    }

    const entity = this.repository.create(data);
    await this.em.flush();
    return { entity, isCreated: true };
  }

  // === 수정 ===

  async update(id: number, data: Partial<FeatureEntity>) {
    const entity = await this.findById(id);
    if (!entity) return null;

    this.repository.assign(entity, data);
    await this.em.flush();
    return entity;
  }

  // === 삭제 ===

  async delete(id: number) {
    const entity = await this.findById(id);
    if (!entity) return false;

    await this.em.removeAndFlush(entity);
    return true;
  }

  // === QueryBuilder (복잡한 쿼리) ===

  async findWithJoin() {
    return this.em
      .createQueryBuilder(FeatureEntity, 'f')
      .select('*')
      .leftJoinAndSelect('f.relation', 'r')
      .where({ 'f.status': 'active' })
      .orderBy({ 'f.regTs': 'DESC' })
      .getResultList();
  }
}
```

---

## 3. Repository Module Template

```typescript
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Module } from '@nestjs/common';
import { RW_CONNECTION } from '../connections';
import { FeatureEntity } from './feature.entity';
import { FeatureRepository } from './feature.repository';

@Module({
  imports: [MikroOrmModule.forFeature([FeatureEntity], RW_CONNECTION)],
  providers: [FeatureRepository],
  exports: [FeatureRepository],
})
export class FeatureRepositoryModule {}
```

---

## 4. Controller Template

```typescript
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';
import { FeatureService } from './feature.service';

@ApiTags('Feature')
@Controller('feature')
export class FeatureController {
  constructor(private readonly featureService: FeatureService) {}

  @ApiOperation({ summary: '목록 조회' })
  @ApiQuery({ name: 'status', type: String, required: false })
  @ApiHeader({ name: 'user-email', required: true })
  @Get('items')
  async getItems(@Query('status') status?: string) {
    return this.featureService.getItems({ status });
  }

  @ApiOperation({ summary: '단일 조회' })
  @Get('items/:id')
  async getItem(@Param('id') id: string) {
    return this.featureService.getItem({ id: Number(id) });
  }

  @ApiOperation({ summary: '생성' })
  @Post('items')
  async createItem(@Body() dto: CreateFeatureDto) {
    return this.featureService.createItem({ dto });
  }

  @ApiOperation({ summary: '수정' })
  @Patch('items/:id')
  async updateItem(@Param('id') id: string, @Body() dto: UpdateFeatureDto) {
    return this.featureService.updateItem({ id: Number(id), dto });
  }

  @ApiOperation({ summary: '삭제' })
  @Delete('items/:id')
  async deleteItem(@Param('id') id: string) {
    return this.featureService.deleteItem({ id: Number(id) });
  }
}
```

---

## 5. Service Template

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { FeatureRepository } from '../../modules/entities/feature/feature.repository';
import { CreateFeatureDto } from './dtos/create-feature.dto';
import { UpdateFeatureDto } from './dtos/update-feature.dto';

@Injectable()
export class FeatureService {
  constructor(private readonly featureRepository: FeatureRepository) {}

  async getItems({ status }: { status?: string }) {
    const condition = status ? { status } : {};
    const [items, totalCount] = await Promise.all([
      this.featureRepository.findByCondition(condition),
      this.featureRepository.count(condition),
    ]);
    return { items, totalCount };
  }

  async getItem({ id }: { id: number }) {
    const item = await this.featureRepository.findById(id);
    if (!item) {
      throw new NotFoundException('항목을 찾을 수 없습니다.');
    }
    return item;
  }

  async createItem({ dto }: { dto: CreateFeatureDto }) {
    // 검증 로직
    if (!dto.name) {
      throw new BadRequestException('이름은 필수입니다.');
    }

    return this.featureRepository.create({
      name: dto.name,
      status: dto.status ?? 'active',
    });
  }

  async updateItem({ id, dto }: { id: number; dto: UpdateFeatureDto }) {
    const item = await this.featureRepository.findById(id);
    if (!item) {
      throw new NotFoundException('항목을 찾을 수 없습니다.');
    }

    return this.featureRepository.update(id, dto);
  }

  async deleteItem({ id }: { id: number }) {
    const deleted = await this.featureRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException('항목을 찾을 수 없습니다.');
    }
    return { success: true };
  }
}
```

---

## 6. Module Template

```typescript
import { Module } from '@nestjs/common';
import { FeatureRepositoryModule } from '../../modules/entities/feature/feature-repository.module';
import { FeatureController } from './feature.controller';
import { FeatureService } from './feature.service';

@Module({
  imports: [FeatureRepositoryModule],
  controllers: [FeatureController],
  providers: [FeatureService],
  exports: [FeatureService],
})
export class FeatureModule {}
```

---

## 7. DTO Templates

### Request DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateFeatureDto {
  @ApiProperty({
    required: true,
    description: '이름',
    example: '샘플 이름',
  })
  name: string;

  @ApiProperty({
    required: false,
    description: '상태',
    example: 'active',
  })
  status?: string;
}
```

### Response DTO

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class GetFeatureResponseDto {
  @ApiProperty({ description: 'ID' })
  id: number;

  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '상태' })
  status: string;

  @ApiProperty({ description: '생성일' })
  regTs: Date;
}
```

---

## 8. 자주 쓰는 MikroORM 쿼리 패턴

```typescript
// LIKE 검색
await repo.find({ name: { $like: `%${keyword}%` } });

// IN 조건
await repo.find({ status: { $in: ['active', 'pending'] } });

// 날짜 범위
await repo.find({
  createdAt: {
    $gte: new Date('2024-01-01'),
    $lte: new Date('2024-12-31'),
  },
});

// OR 조건
await repo.find({
  $or: [{ status: 'active' }, { priority: 'high' }],
});

// 정렬 + 페이징
await repo.find(
  { status: 'active' },
  {
    orderBy: { createdAt: 'DESC' },
    limit: 10,
    offset: 0,
  }
);

// 관계 로딩
await repo.findOne({ id }, { populate: ['profile', 'posts'] });

// 카운트
await repo.count({ status: 'active' });
```

---

## 사용법

1. 새 기능 추가 시 위 템플릿 복사
2. `Feature` → 실제 기능명으로 치환
3. 필요한 필드/메서드 추가/삭제
4. Module에 import 등록

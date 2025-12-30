# 학습용 AI 프롬프트 모음

단계별로 AI에게 물어보면서 학습하기.

---

## Level 1: 코드 읽기 (이해)

### 1-1. 특정 API 흐름 따라가기

```
User 모듈의 GET /user/users API가 어떻게 동작하는지
Controller → Service → Repository 흐름으로 설명해줘.
각 계층에서 어떤 일이 일어나는지 코드와 함께 보여줘.
```

### 1-2. Entity 구조 이해하기

```
UserEntity를 보고 설명해줘:
1. 어떤 테이블과 매핑되는지
2. 각 필드가 DB에서 어떤 컬럼인지
3. @Property 데코레이터 옵션들이 뭘 의미하는지
```

### 1-3. Repository 패턴 이해하기

```
UserRepository의 메서드들을 분석해줘:
1. findOne vs find 차이
2. flush()가 왜 필요한지
3. assign()이 뭘 하는지
```

### 1-4. Module 의존성 이해하기

```
UserModule이 어떤 모듈들을 import하고 있는지 보고,
왜 그 모듈들이 필요한지 설명해줘.
```

---

## Level 2: 코드 분석 (비교)

### 2-1. 두 모듈 비교하기

```
Address 모듈과 User 모듈을 비교해줘:
1. 구조적 차이점
2. Address는 왜 Repository가 없는지
3. 어떤 상황에서 각 패턴을 쓰는지
```

### 2-2. 쿼리 패턴 비교하기

```
UserRepository에서 findOne()을 쓰는 경우와
createQueryBuilder()를 쓰는 경우를 비교해줘.
언제 어떤 걸 써야 하는지 기준도 알려줘.
```

### 2-3. 에러 처리 패턴 분석

```
UserService에서 에러를 던지는 부분들을 찾아서:
1. 어떤 상황에서 어떤 에러를 쓰는지
2. NotFoundException vs BadRequestException 기준
3. 프론트에서 이 에러를 어떻게 받게 되는지
```

---

## Level 3: 코드 작성 (실습)

### 3-1. 간단한 조회 API 추가

```
User 모듈에 새 API를 추가해줘:
GET /user/users/:id/profile
- userId로 유저 조회
- 없으면 404 에러
- 기존 패턴 따라서 작성

코드 작성 전에 어떤 파일을 수정해야 하는지 먼저 알려줘.
```

### 3-2. 필터 기능 추가

```
GET /user/users API에 createdAt 날짜 필터 추가해줘:
- startDate, endDate 쿼리 파라미터
- 기존 team, role 필터와 함께 동작
- Repository에 새 메서드 필요하면 추가

단계별로 어떤 파일을 어떻게 수정하는지 보여줘.
```

### 3-3. 새 Entity 추가

```
Notification Entity를 새로 만들어줘:
- id, userId, message, isRead, createdAt 필드
- User와 1:N 관계
- 기존 Entity 패턴 따라서

Entity만 만들고, Repository는 아직 안 만들어도 돼.
```

### 3-4. CRUD API 전체 구현

```
Notification CRUD API를 만들어줘:
1. Entity (위에서 만든 거 사용)
2. Repository
3. Service
4. Controller
5. DTO

User 모듈 패턴 참고해서 만들어줘.
한 파일씩 순서대로 보여줘.
```

---

## Level 4: 디버깅/개선 (응용)

### 4-1. 성능 개선 포인트 찾기

```
UserService.getInquiryAssigneeInfos() 메서드를 보고:
1. N+1 쿼리 문제가 있는지
2. 개선할 수 있는 부분이 있는지
3. 어떻게 수정하면 좋을지
```

### 4-2. 코드 리팩토링

```
UserService의 createWhereOption 메서드를 보고:
1. 중복 코드가 있는지
2. 더 깔끔하게 작성할 수 있는지
3. 리팩토링 방법 제안해줘
```

### 4-3. 테스트 코드 작성

```
UserService.getUsers() 메서드의 단위 테스트를 작성해줘:
1. 정상 케이스
2. 빈 결과 케이스
3. 필터 조건 케이스

jest-mock-extended 사용해서 Repository mock 처리해줘.
```

---

## 대화형 학습 프롬프트

### 개념 질문

```
NestJS에서 @Injectable() 데코레이터가 뭐하는 건지,
React의 어떤 개념과 비슷한지 FE 관점에서 설명해줘.
```

```
MikroORM의 flush()가 왜 필요한지,
React의 setState()와 비교해서 설명해줘.
```

```
Controller에서 @Query(), @Body(), @Param()의 차이를
fetch API 사용할 때와 비교해서 설명해줘.
```

### 왜 이렇게 했는지 질문

```
UserRepository에서 writeRepository와 writeEntityManager를
따로 주입받는 이유가 뭐야?
```

```
UserService에서 Promise.all()로 findAllBy와 countBy를
동시에 호출하는 이유가 뭐야?
```

```
Entity에서 id 필드에 ?를 붙여서 optional로 한 이유가 뭐야?
```

---

## 사용 팁

1. **한 번에 하나씩**: 여러 개 물어보지 말고 하나씩 깊게
2. **코드와 함께**: "코드 보여줘"를 꼭 포함
3. **FE 비유 요청**: "React로 비유하면?" 추가하면 이해 쉬움
4. **왜?를 물어봐**: 단순히 뭔지보다 왜 그렇게 하는지
5. **직접 수정 요청**: 읽기만 하지 말고 수정해보기

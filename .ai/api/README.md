# ai/

AI 어시스턴트 컨텍스트 및 학습 자료 모음.

## 구조

```
ai/
├── LEARNING.md              ← AI 컨텍스트용 (개념 정리)
├── prompts/
│   └── learning-prompts.md  ← 사용자 참고용 (질문 모음)
└── README.md                ← 이 파일
```

## 파일별 용도

| 파일 | 용도 | 사용법 |
|------|------|--------|
| `LEARNING.md` | AI가 프로젝트 구조/패턴 이해 | `@ai/LEARNING.md`로 참조 |
| `prompts/learning-prompts.md` | 학습용 질문 템플릿 | 복사해서 AI에게 질문 |

## 사용 방법

### AI 컨텍스트로 사용

```
# Claude Code에서
@ai/LEARNING.md 이 프로젝트의 레이어 구조 설명해줘
```

### 학습 질문 사용

1. `prompts/learning-prompts.md` 열기
2. 원하는 질문 복사
3. AI에게 붙여넣기

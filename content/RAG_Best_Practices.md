---
title: RAG 시스템 구축 모범 사례 및 청킹 전략
tags:
  - ai
  - rag
  - langchain
  - architecture
---

## 청킹(Chunking) 전략

`RecursiveCharacterTextSplitter` 사용 시 **chunk_size 500~1000자, chunk_overlap 10~20%**(50~100자)가 일반적인 시작점이다. 청크가 너무 작으면 문맥이 끊기고, 너무 크면 검색 정밀도가 떨어지고 토큰 비용이 증가한다. 문단(`\n\n`) → 줄바꿈 → 공백 순으로 자연스러운 경계에서 분할되도록 separator 우선순위를 유지한다.

## 임베딩 모델: text-embedding-3-small

- 1536차원, 저비용($0.02/1M tokens)으로 한국어 포함 다국어 검색 품질이 우수하다.
- **색인과 검색에 반드시 동일한 임베딩 모델을 사용**해야 한다. 모델을 바꾸면 전체 재색인이 필요하다.

## Vector DB 검색 팁 (Chroma)

- Chroma 기본 거리 함수는 L2이며, 필요 시 `collection_metadata={"hnsw:space": "cosine"}`으로 코사인 유사도를 지정한다.
- **k값은 3~5로 시작**해 답변 품질을 보며 조정한다. k가 크면 무관한 청크가 섞여 노이즈가 증가한다.

## 환각(Hallucination) 방지 프롬프트

시스템 프롬프트에 다음 세 가지를 명시한다:

1. "제공된 맥락(context)에만 근거해 답변하라"
2. "맥락에 없으면 **모른다고 답하라**" (탈출구 제공이 핵심)
3. 답변에 출처를 함께 반환해 사용자가 검증할 수 있게 한다.

관련 문서: [[Render_FastAPI_Deployment]]

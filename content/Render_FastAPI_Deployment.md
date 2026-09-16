---
title: Render 및 Docker를 활용한 FastAPI 백엔드 배포 가이드
tags:
  - devops
  - render
  - docker
  - fastapi
---

## 프로덕션 서버 설정

Uvicorn 실행 시 `--host 0.0.0.0`과 플랫폼이 주입하는 `$PORT`를 사용한다. 무거운 리소스(Vector DB, LLM 체인)는 FastAPI **lifespan**에서 1회만 초기화해 요청마다 재로딩하지 않는다.

```dockerfile
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
```

## Dockerfile 패키징

`python:3.11-slim` 기반으로 **requirements.txt를 먼저 COPY/설치**해 레이어 캐시를 활용한다. chromadb 등 네이티브 확장이 빌드 실패하면 `apt-get install -y build-essential`로 C++ 컴파일러를 추가한다(단, wheel이 제공되는 버전은 불필요). `.dockerignore`에 `.env`를 반드시 포함한다.

## CORS 보안

`allow_origins=["*"]`는 피하고 **프론트엔드 도메인만 명시적으로 허용**한다. Origin은 경로 없이 도메인까지만 지정한다(예: `https://<계정>.github.io`). 메서드도 `GET, POST`로 최소화한다.

## 환경 변수와 헬스 체크

- API Key는 코드/이미지에 넣지 않고 **Render 대시보드의 Environment Variables**로 주입한다.
- `/health` 엔드포인트를 만들어 배포 검증과 무료 플랜 콜드 스타트(15분 미사용 시 슬립) 상태 확인에 활용한다.

관련 문서: [[RAG_Best_Practices]], [[Quartz_Obsidian_Guide]]

---
tags:
  - troubleshooting
  - docker
  - python
created: 2026-09-16
---

# Python이 없는 PC에서 Docker로 인덱싱 파이프라인 실행하기

**문제**: 새 PC에서 `python 1_build_db.py`를 실행하려니 Python 미설치 (`python` 입력 시 Microsoft Store 설치 안내만 뜸. `py` 런처도 없음).

**원인**: Windows는 Python이 기본 탑재되지 않고, 미설치 상태의 `python` 명령은 Store 앱 실행 별칭(App Execution Alias)으로 연결되어 있다.

**해결**: 어차피 배포가 Docker 기반이면 Python을 설치할 필요 없이 **배포용 이미지 안에서 스크립트를 실행**하면 된다. 의존성도 이미지에 이미 들어 있다.

```powershell
docker run --rm --env-file backend/.env `
  -v C:\...\backend:/work `
  -v C:\...\quartz\content:/quartz/content:ro `
  -w /work kb-rag-backend python 1_build_db.py
```

**포인트**:
- 결과물(chroma_db)이 호스트에 남도록 작업 폴더를 통째로 마운트하고 `-w /work`로 작업 디렉터리를 지정 (출력 폴더만 따로 마운트하면 스크립트의 `shutil.rmtree`가 마운트 포인트를 못 지워 실패할 수 있음)
- 노트 폴더는 `:ro`(읽기 전용)로 마운트해 원본 훼손 방지
- API 키는 `--env-file`로 주입

**교훈**: "로컬 실행 환경이 없다"는 문제는 Docker 이미지가 곧 실행 환경이라는 관점으로 풀면 간단해진다. 호스트에는 Docker Desktop만 있으면 된다.

관련: [[지식베이스 아키텍처 구조]]

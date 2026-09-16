---
title: Quartz v5 및 Obsidian 기반 디지털 가든 웹 출판 가이드
tags:
  - quartz
  - obsidian
  - github-pages
  - frontend
---

## 콘텐츠 관리 구조

`quartz/content` 폴더가 사이트의 루트다. Obsidian 볼트의 마크다운을 이 폴더에 두면 빌드 시 HTML로 변환된다. `.obsidian`, `private`, `templates` 폴더는 `ignorePatterns`로 제외한다. `index.md`가 홈 화면이 된다.

## GitHub Actions 자동 배포

배포 브랜치에 push하면 `deploy.yaml` 워크플로가 `npx quartz build` → `actions/deploy-pages`로 GitHub Pages에 자동 배포한다. 로컬 검증은 `npx quartz build --serve`(포트 8080)로 한다.

## 사용자 정의 컴포넌트 추가

Quartz v4는 `quartz.layout.ts`에 컴포넌트를 등록하지만, **v5(플러그인 포크)는 `quartz.config.yaml`의 plugins 항목**으로 레이아웃을 구성한다. 챗봇 위젯처럼 모든 페이지에 띄우는 플로팅 요소는 `quartz/components/`에 컴포넌트를 만들고 `frames/DefaultFrame.tsx`에서 렌더링하는 방식이 간단하다. 스타일은 테마 CSS 변수(`--secondary` 등)를 쓰면 다크모드에 자동 대응한다.

## 위키링크 주의점

- `[[파일명]]`은 확장자 없이 쓰고, 파일명이 바뀌면 링크가 깨지므로 **frontmatter의 `aliases`**로 구버전 이름을 유지한다.
- 표시 텍스트는 `[[파일명|보이는 이름]]` 형태로 지정한다.
- 한글 파일명도 지원되지만 URL 슬러그가 인코딩되므로 공유용 문서는 영문 파일명을 권장한다.

관련 문서: [[RAG_Best_Practices]], [[Render_FastAPI_Deployment]]

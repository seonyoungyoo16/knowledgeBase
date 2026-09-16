---
tags:
  - troubleshooting
  - quartz
  - frontend
created: 2026-09-16
---

# Quartz 로컬 미리보기에서 메뉴 링크가 전부 404

**문제**: 로컬 서버(`npx quartz build --serve`, 포트 8080)에서 탐색기 메뉴를 클릭하면 `localhost:8080/knowledgeBase/노트이름`으로 이동하며 404.

**원인**: Quartz는 빌드 시 `<body data-basepath>`에 URL 접두사를 굽는데, 이 값이 빌드 모드에 따라 다르다.

| 빌드 방식 | basepath | 용도 |
|---|---|---|
| `npx quartz build` (프로덕션) | `/knowledgeBase` (baseUrl의 하위 경로) | GitHub Pages |
| `npx quartz build --serve` (로컬) | 빈 값 | 로컬 미리보기 |

두 빌드가 **같은 `public` 폴더를 덮어쓰기** 때문에, 로컬 서버를 띄워둔 상태에서 프로덕션 빌드를 돌리면 로컬 링크가 전부 `/knowledgeBase/...`를 가리켜 깨진다.

**해결**: `--serve` 모드로 다시 빌드하면 복원됨. 브라우저 캐시가 남을 수 있으니 강력 새로고침(Ctrl+Shift+R).

**교훈**: 배포 빌드는 GitHub Actions가 push 시 알아서 하므로 **로컬에서 프로덕션 빌드를 돌릴 이유가 없다**. 로컬 검증은 항상 `--serve`로만.

관련: [[Quartz_Obsidian_Guide]]

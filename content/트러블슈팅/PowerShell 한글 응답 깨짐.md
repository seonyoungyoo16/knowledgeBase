---
tags:
  - troubleshooting
  - powershell
  - encoding
created: 2026-09-16
---

# PowerShell에서 API 한글 응답이 깨질 때

**문제**: `Invoke-RestMethod`로 FastAPI 서버의 한국어 JSON 응답을 받으면 `ì§ìë² ì´ì¤...` 식으로 깨져 보임.

**원인**: Windows PowerShell 5.1이 `charset` 명시가 없는 UTF-8 응답을 Latin-1로 디코딩함. **서버는 정상**이고 순전히 클라이언트 표시 문제.

**해결**: 진짜 깨졌는지 확인하려면 `StreamReader`에 UTF-8을 명시해서 원본 바이트를 직접 디코딩한다.

```powershell
$reader = New-Object System.IO.StreamReader($resp.GetResponseStream(), [System.Text.Encoding]::UTF8)
$reader.ReadToEnd()   # 정상 한글 출력
```

**교훈**: 인코딩이 깨져 보이면 서버 고치기 전에 "어느 쪽이 깨뜨렸는지"부터 분리 검증할 것. 브라우저(fetch)는 UTF-8을 기본 처리하므로 실제 프론트엔드에서는 문제없었다.

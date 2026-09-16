import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

// RAG 백엔드 (Render Docker 배포) 주소 — 재배포로 주소가 바뀌면 여기만 수정
const CHAT_API_BASE = "https://knowledgebase-backend-an48.onrender.com"

const widgetCss = `
.chat-widget-toggle {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 50%;
  border: none;
  background: var(--secondary);
  color: var(--light);
  font-size: 1.4rem;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  z-index: 998;
  transition: transform 0.15s ease;
}
.chat-widget-toggle:hover { transform: scale(1.08); }
.chat-widget-panel {
  position: fixed;
  bottom: 5.5rem;
  right: 1.5rem;
  width: min(24rem, calc(100vw - 2rem));
  height: min(32rem, calc(100vh - 8rem));
  display: none;
  flex-direction: column;
  background: var(--light);
  border: 1px solid var(--lightgray);
  border-radius: 0.75rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.25);
  z-index: 999;
  overflow: hidden;
}
.chat-widget-panel.open { display: flex; }
.chat-widget-header {
  padding: 0.75rem 1rem;
  background: var(--secondary);
  color: var(--light);
  font-weight: 700;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.chat-widget-header button {
  background: none;
  border: none;
  color: var(--light);
  font-size: 1.1rem;
  cursor: pointer;
}
.chat-widget-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.chat-widget-msg {
  max-width: 85%;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
  font-size: 0.9rem;
  line-height: 1.45;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-widget-msg.user {
  align-self: flex-end;
  background: var(--secondary);
  color: var(--light);
}
.chat-widget-msg.bot {
  align-self: flex-start;
  background: var(--highlight);
  color: var(--darkgray);
}
.chat-widget-msg.bot .chat-widget-sources {
  margin-top: 0.4rem;
  font-size: 0.75rem;
  color: var(--gray);
}
.chat-widget-msg.loading { color: var(--gray); font-style: italic; }
.chat-widget-input-row {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--lightgray);
}
.chat-widget-input-row input {
  flex: 1;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--lightgray);
  border-radius: 0.5rem;
  background: var(--light);
  color: var(--darkgray);
  font-size: 0.9rem;
}
.chat-widget-input-row input:focus { outline: 2px solid var(--secondary); }
.chat-widget-input-row button {
  padding: 0.5rem 0.9rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--secondary);
  color: var(--light);
  font-weight: 600;
  cursor: pointer;
}
.chat-widget-input-row button:disabled { opacity: 0.5; cursor: default; }
`

// document 레벨 이벤트 위임 + 전역 가드 사용:
// SPA 내비게이션(micromorph)으로 DOM이 교체되어도 리스너가 살아있고, 중복 바인딩도 방지됨
const widgetScript = `
(function () {
  if (window.__kbChatWidgetInit) return
  window.__kbChatWidgetInit = true

  var API_BASE = ${JSON.stringify(CHAT_API_BASE)}
  var busy = false

  function el(id) { return document.getElementById(id) }

  function addMsg(role, text) {
    var messages = el("chat-widget-messages")
    if (!messages) return null
    var div = document.createElement("div")
    div.className = "chat-widget-msg " + role
    div.textContent = text
    messages.appendChild(div)
    messages.scrollTop = messages.scrollHeight
    return div
  }

  function send() {
    if (busy) return
    var input = el("chat-widget-input")
    if (!input) return
    var question = input.value.trim()
    if (!question) return
    input.value = ""
    addMsg("user", question)

    busy = true
    var sendBtn = el("chat-widget-send")
    if (sendBtn) sendBtn.disabled = true
    var loading = addMsg("bot loading", "생각 중... (서버가 잠들어 있었다면 깨우는 데 30초~1분 걸릴 수 있어요)")

    fetch(API_BASE + "/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: question }),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status)
        return res.json()
      })
      .then(function (data) {
        if (!loading) return
        loading.className = "chat-widget-msg bot"
        loading.textContent = data.answer
        if (data.sources && data.sources.length > 0) {
          var src = document.createElement("div")
          src.className = "chat-widget-sources"
          src.textContent = "출처: " + data.sources.join(", ")
          loading.appendChild(src)
        }
      })
      .catch(function (err) {
        if (!loading) return
        loading.className = "chat-widget-msg bot"
        loading.textContent = "오류가 발생했어요. 잠시 후 다시 시도해 주세요. (" + err.message + ")"
      })
      .finally(function () {
        busy = false
        var btn = el("chat-widget-send")
        if (btn) btn.disabled = false
        var messages = el("chat-widget-messages")
        if (messages) messages.scrollTop = messages.scrollHeight
      })
  }

  document.addEventListener("click", function (e) {
    var target = e.target
    if (!(target instanceof Element)) return
    if (target.closest("#chat-widget-toggle")) {
      var panel = el("chat-widget-panel")
      if (panel) {
        panel.classList.toggle("open")
        if (panel.classList.contains("open")) {
          var input = el("chat-widget-input")
          if (input) input.focus()
        }
      }
    } else if (target.closest("#chat-widget-close")) {
      var p = el("chat-widget-panel")
      if (p) p.classList.remove("open")
    } else if (target.closest("#chat-widget-send")) {
      send()
    }
  })

  document.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && e.target instanceof Element && e.target.id === "chat-widget-input") {
      e.preventDefault()
      send()
    }
  })
})()
`

const ChatWidget: QuartzComponent = (_props: QuartzComponentProps) => {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: widgetCss }} />
      <button id="chat-widget-toggle" class="chat-widget-toggle" aria-label="지식베이스 챗봇 열기">
        💬
      </button>
      <div id="chat-widget-panel" class="chat-widget-panel">
        <div class="chat-widget-header">
          <span>🪴 지식베이스 챗봇</span>
          <button id="chat-widget-close" aria-label="닫기">
            ✕
          </button>
        </div>
        <div id="chat-widget-messages" class="chat-widget-messages">
          <div class="chat-widget-msg bot">
            안녕하세요! 노트 내용에 대해 무엇이든 물어보세요.
          </div>
        </div>
        <div class="chat-widget-input-row">
          <input
            id="chat-widget-input"
            type="text"
            placeholder="질문을 입력하세요..."
            autocomplete="off"
          />
          <button id="chat-widget-send">전송</button>
        </div>
      </div>
      <script dangerouslySetInnerHTML={{ __html: widgetScript }} />
    </>
  )
}

export default (() => ChatWidget) satisfies QuartzComponentConstructor

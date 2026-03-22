import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { formatRelativeTime } from '../../utils/helpers'

/* ═══════════════════════════════════════════════════════
   Knowledge Agent Drawer
   ─ Right-side drawer with AI-powered Q&A
   ─ Local mode: searches personal cards
   ─ Online mode: simulates web-augmented answers
   ─ Chat history with 10-min resume logic
   ═══════════════════════════════════════════════════════ */

const TEN_MINUTES = 10 * 60 * 1000

// ── Chinese stop-words ──
const STOP_WORDS = new Set([
  '的', '是', '在', '了', '和', '与', '到', '对', '中', '有', '什么',
  '如何', '怎么', '为什么', '哪些', '吗', '呢', '吧', '啊', '把',
  '被', '让', '给', '从', '向', '以', '将', '能', '会', '可以',
  '应该', '可能', '我', '你', '他', '它', '我们', '他们', '这', '那',
  '这个', '那个', '最', '都', '也', '还', '就', '又', '才', '要',
  '不', '没', '没有', '很', '更', '最近', '一些', '一个', '所有',
  '关于', '通过', '进行', '之间', '核心', '方法论', '应用', '日常',
  '工作', '收藏', '内容', '共同', '主题', '关系',
])

// ── Keyword extraction ──
function extractKeywords(query) {
  const cleaned = query.replace(/[？?！!，,。.、：:；;""''「」【】（）()]/g, ' ')
  const tokens = new Set()
  cleaned.split(/\s+/).forEach(w => {
    if (w.length >= 2 && !STOP_WORDS.has(w)) tokens.add(w)
  })
  const chars = cleaned.replace(/\s+/g, '')
  if (chars.length >= 2) {
    for (let i = 0; i < chars.length - 1; i++) {
      const bigram = chars.slice(i, i + 2)
      if (!STOP_WORDS.has(bigram)) tokens.add(bigram)
    }
  }
  return [...tokens]
}

// ── Card search with scoring ──
function searchCards(cards, query) {
  const keywords = extractKeywords(query)
  if (keywords.length === 0) return []
  const doneCards = cards.filter(c => c.status === 'done')
  const scored = doneCards.map(card => {
    const haystack = [
      card.title,
      card.summary?.coreIdea,
      ...(card.summary?.keyPoints || []),
      card.note,
      ...(card.tags || []),
    ].filter(Boolean).join(' ').toLowerCase()
    let score = 0
    keywords.forEach(kw => {
      if (haystack.includes(kw.toLowerCase())) score += kw.length
    })
    ;(card.tags || []).forEach(tag => {
      if (query.includes(tag)) score += 10
    })
    return { card, score }
  })
  return scored.filter(s => s.score > 0).sort((a, b) => b.score - a.score).map(s => s.card)
}

// ── Answer generators ──
function generateLocalAnswer(query, cards) {
  const doneCards = cards.filter(c => c.status === 'done')
  if (query.includes('主题') && (query.includes('收藏') || query.includes('共同') || query.includes('最多'))) {
    const tagMap = {}
    doneCards.forEach(c => c.tags?.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1 }))
    const sorted = Object.entries(tagMap).sort((a, b) => b[1] - a[1])
    let answer = `你一共有 ${doneCards.length} 张知识卡片，涵盖 ${sorted.length} 个标签。\n\n收藏最多的主题：\n`
    sorted.slice(0, 6).forEach(([tag, count], i) => { answer += `${i + 1}. 「${tag}」— ${count} 张卡片\n` })
    answer += `\n你的知识库主要围绕认知提升、产品思维和个人效能展开。`
    return { text: answer, cards: doneCards.slice(0, 5) }
  }
  const matched = searchCards(cards, query)
  if (matched.length === 0) {
    return { text: `未找到与「${query}」相关的知识卡片。试试换个关键词，或切换到联网模式获取更多信息。`, cards: [] }
  }
  const topCards = matched.slice(0, 5)
  const coreIdeas = topCards.map(c => c.summary?.coreIdea).filter(Boolean)
  let answer = `基于你的 ${matched.length} 张相关知识卡片，为你整理如下：\n\n`
  coreIdeas.forEach((idea, i) => { answer += `${i + 1}. ${idea}\n` })
  if (topCards.length > 0 && topCards[0].summary?.keyPoints?.length) {
    answer += `\n深入来看，「${topCards[0].title}」中提到：\n`
    topCards[0].summary.keyPoints.slice(0, 3).forEach(p => { answer += `  · ${p}\n` })
  }
  answer += `\n共找到 ${matched.length} 张相关卡片，以下是最相关的 ${topCards.length} 张。`
  return { text: answer, cards: topCards }
}

function generateOnlineAnswer(query, cards) {
  const local = generateLocalAnswer(query, cards)
  let answer = local.text
  answer += `\n\n── 联网补充 ──\n基于网络搜索，关于「${query}」的最新见解：\n`
  answer += `  · 该领域近期研究表明，结合个人知识体系进行主动回顾，记忆留存率可提升 40%-60%。\n`
  answer += `  · 建议将碎片化信息通过"原子化笔记"方式整合，构建可检索的知识网络。\n`
  answer += `  · 学术界推荐使用"间隔重复 + 主动召回"的组合策略进行深度学习。`
  return { text: answer, cards: local.cards }
}

function getSuggestions(cards) {
  const doneCards = cards.filter(c => c.status === 'done')
  if (doneCards.length === 0) return []
  const tagMap = {}
  doneCards.forEach(c => c.tags?.forEach(t => { tagMap[t] = (tagMap[t] || 0) + 1 }))
  const topTags = Object.entries(tagMap).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t]) => t)
  const suggestions = []
  if (topTags[0]) suggestions.push(`关于「${topTags[0]}」我有哪些笔记？`)
  if (topTags[1]) suggestions.push(`总结一下「${topTags[1]}」的要点`)
  if (doneCards.length > 5) suggestions.push(`我收藏最多的主题是什么？`)
  if (topTags[2] && topTags[0]) suggestions.push(`「${topTags[2]}」和「${topTags[0]}」`)
  return suggestions.slice(0, 4)
}

// ── Icons ──
function IconClose() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
}
function IconHistory() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
}
function IconNewChat() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function IconBack() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
}
function IconDelete() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></svg>
}
function IconSend() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
}
function IconAgent() {
  return <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
}
function IconSearch() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
}

// ── Small reusable button ──
function HeaderBtn({ onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-3)', padding: 6, borderRadius: 6,
        transition: 'color 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
    >
      {children}
    </button>
  )
}


/* ═════════════════════════════════════════════════════
   Main Component
   ═════════════════════════════════════════════════════ */
export function KnowledgeDrawer() {
  const {
    drawerOpen, closeDrawer, drawerMode, toggleDrawerMode, cards,
    chatSessions, activeChatId, lastChatTimestamp,
    createChatSession, updateChatSession, deleteChatSession, setActiveChatId,
  } = useStore()

  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState([])
  const [isThinking, setIsThinking] = useState(false)
  const [showHistory, setShowHistory] = useState(false) // history list view
  const inputRef = useRef(null)
  const scrollRef = useRef(null)
  const navigate = useNavigate()
  const hasInitRef = useRef(false) // track whether we've initialised for this open

  const suggestions = getSuggestions(cards)

  // ── On drawer open: decide resume vs new ──
  useEffect(() => {
    if (!drawerOpen) {
      hasInitRef.current = false
      return
    }
    if (hasInitRef.current) return
    hasInitRef.current = true

    setShowHistory(false)
    setQuery('')

    const now = Date.now()
    const lastTs = lastChatTimestamp ? new Date(lastChatTimestamp).getTime() : 0
    const elapsed = now - lastTs

    if (elapsed <= TEN_MINUTES && activeChatId) {
      // Resume last conversation
      const session = chatSessions.find(s => s.id === activeChatId)
      if (session && session.messages.length > 0) {
        setMessages(session.messages)
        return
      }
    }

    // Start fresh — new conversation (don't persist until first message)
    setActiveChatId(null)
    setMessages([])

    setTimeout(() => inputRef.current?.focus(), 300)
  }, [drawerOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Auto-scroll ──
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages, isThinking])

  // ── Escape to close ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        if (showHistory) { setShowHistory(false); return }
        closeDrawer()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [drawerOpen, closeDrawer, showHistory])

  // ── Submit a question ──
  const handleSubmit = useCallback((q) => {
    const text = (q || query).trim()
    if (!text || isThinking) return

    const newMsgs = [...messages, { role: 'user', text }]
    setMessages(newMsgs)
    setQuery('')
    setIsThinking(true)

    // Create session on first message if none active
    let sessionId = activeChatId
    if (!sessionId) {
      sessionId = createChatSession(drawerMode)
    }

    // Save user message immediately
    updateChatSession(sessionId, newMsgs)

    // Simulate AI thinking
    const delay = 800 + Math.random() * 1200
    setTimeout(() => {
      const result = drawerMode === 'local'
        ? generateLocalAnswer(text, cards)
        : generateOnlineAnswer(text, cards)

      const withReply = [...newMsgs, {
        role: 'agent',
        text: result.text,
        cards: result.cards,
      }]
      setMessages(withReply)
      updateChatSession(sessionId, withReply)
      setIsThinking(false)
    }, delay)
  }, [query, isThinking, drawerMode, cards, messages, activeChatId, createChatSession, updateChatSession])

  // ── Load a historical session ──
  const loadSession = (session) => {
    setActiveChatId(session.id)
    setMessages(session.messages)
    setShowHistory(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Start new conversation ──
  const startNewChat = () => {
    setActiveChatId(null)
    setMessages([])
    setShowHistory(false)
    setTimeout(() => inputRef.current?.focus(), 100)
  }

  // ── Navigate to card ──
  const handleCardClick = (cardId) => {
    navigate(`/space/card/${cardId}`)
    closeDrawer()
  }

  // Current session for header display
  const activeSession = activeChatId ? chatSessions.find(s => s.id === activeChatId) : null

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-[199]"
          style={{ background: 'rgba(23,22,26,0.25)', backdropFilter: 'blur(4px)' }}
          onClick={closeDrawer}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-[200] flex flex-col"
        style={{
          width: 420,
          maxWidth: '100vw',
          background: 'var(--bg)',
          borderLeft: '1px solid var(--line)',
          boxShadow: drawerOpen ? 'var(--shadow-lg)' : 'none',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
          willChange: 'transform',
        }}
      >
        {/* ═══ Header ═══ */}
        <div
          className="flex items-center justify-between px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--line)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            {showHistory && (
              <HeaderBtn onClick={() => setShowHistory(false)} title="返回对话">
                <IconBack />
              </HeaderBtn>
            )}
            <div className="min-w-0">
              <p className="font-display text-base truncate" style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}>
                {showHistory ? '历史对话' : (activeSession?.title || '知识问答')}
              </p>
              <p className="text-[9px] tracking-[0.12em] uppercase mt-0.5" style={{ color: 'var(--text-3)' }}>
                {showHistory
                  ? `${chatSessions.length} 条对话记录`
                  : `Knowledge Agent · ${cards.filter(c => c.status === 'done').length} cards indexed`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-0.5 flex-shrink-0">
            {!showHistory && (
              <>
                <HeaderBtn onClick={startNewChat} title="新建对话">
                  <IconNewChat />
                </HeaderBtn>
                <HeaderBtn onClick={() => setShowHistory(true)} title="历史对话">
                  <IconHistory />
                </HeaderBtn>
              </>
            )}
            <HeaderBtn onClick={closeDrawer} title="关闭">
              <IconClose />
            </HeaderBtn>
          </div>
        </div>

        {showHistory ? (
          /* ═══ History List View ═══ */
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {chatSessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-5">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(139,126,116,0.08)', border: '1px solid var(--line)' }}
                >
                  <IconHistory />
                </div>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>暂无历史对话</p>
              </div>
            ) : (
              <div className="p-3 space-y-1">
                {chatSessions.map((sess) => (
                  <div
                    key={sess.id}
                    className="group flex items-center gap-2 px-3.5 py-3 rounded-lg transition-all duration-200"
                    style={{
                      background: sess.id === activeChatId ? 'var(--bg-3)' : 'transparent',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      if (sess.id !== activeChatId) e.currentTarget.style.background = 'var(--bg-2)'
                    }}
                    onMouseLeave={e => {
                      if (sess.id !== activeChatId) e.currentTarget.style.background = 'transparent'
                    }}
                    onClick={() => loadSession(sess)}
                  >
                    {/* Session info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] truncate" style={{
                        color: sess.id === activeChatId ? 'var(--text-1)' : 'var(--text-2)',
                        fontWeight: sess.id === activeChatId ? 400 : 300,
                      }}>
                        {sess.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>
                          {formatRelativeTime(sess.updatedAt)}
                        </span>
                        <span className="text-[9px]" style={{ color: 'var(--text-3)', opacity: 0.5 }}>·</span>
                        <span className="text-[9px]" style={{ color: 'var(--text-3)' }}>
                          {sess.messages.filter(m => m.role === 'user').length} 轮对话
                        </span>
                        <span
                          className="text-[8px] px-1.5 py-0.5 rounded"
                          style={{
                            background: 'rgba(139,126,116,0.06)',
                            color: 'var(--text-3)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {sess.mode === 'online' ? '联网' : '本地'}
                        </span>
                      </div>
                    </div>

                    {/* Delete button — only on hover */}
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-md"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-3)',
                        flexShrink: 0,
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteChatSession(sess.id)
                        if (sess.id === activeChatId) {
                          setMessages([])
                        }
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#b86a5a'}
                      onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      title="删除对话"
                    >
                      <IconDelete />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ═══ Chat View ═══ */
          <>
            {/* Mode toggle */}
            <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--line-2, var(--line))' }}>
              <div
                className="flex rounded-lg p-0.5"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--line)' }}
              >
                {[
                  { key: 'local', label: '本地知识库' },
                  { key: 'online', label: '联网辅助' },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => { if (drawerMode !== key) toggleDrawerMode() }}
                    className="flex-1 py-2 rounded-md text-xs transition-all duration-300"
                    style={{
                      background: drawerMode === key ? 'var(--surface)' : 'transparent',
                      color: drawerMode === key ? 'var(--text-1)' : 'var(--text-3)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: drawerMode === key ? 400 : 300,
                      boxShadow: drawerMode === key ? 'var(--shadow-sm)' : 'none',
                      letterSpacing: '0.03em',
                    }}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      {key === 'local' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                      )}
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-5 py-4 no-scrollbar"
            >
              {messages.length === 0 && !isThinking ? (
                /* Welcome state */
                <div className="flex flex-col items-center justify-center h-full anim-fade">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ background: 'rgba(139,126,116,0.08)', border: '1px solid var(--line)' }}
                  >
                    <IconSearch />
                  </div>
                  <p className="font-display text-sm mb-1" style={{ color: 'var(--text-1)', fontStyle: 'italic' }}>
                    你想了解什么？
                  </p>
                  <p className="text-[10px] mb-6 text-center leading-relaxed" style={{ color: 'var(--text-3)', maxWidth: 240 }}>
                    基于你的 {cards.filter(c => c.status === 'done').length} 张知识卡片，为你找到答案
                  </p>

                  {suggestions.length > 0 && (
                    <div className="w-full space-y-2">
                      <p className="text-[9px] tracking-[0.15em] uppercase mb-2" style={{ color: 'var(--text-3)' }}>你可能想问</p>
                      {suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSubmit(s)}
                          className="w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all duration-200"
                          style={{
                            background: 'var(--bg-2)', border: '1px solid var(--line)',
                            color: 'var(--text-2)', cursor: 'pointer',
                            fontFamily: 'inherit', fontWeight: 300, letterSpacing: '0.01em',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'rgba(139,126,116,0.25)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--line)' }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                /* Conversation */
                <div className="space-y-4">
                  {messages.map((msg, i) => (
                    <div key={i} className={`anim-fade ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      {msg.role === 'user' ? (
                        <div
                          className="max-w-[85%] px-3.5 py-2.5 rounded-xl text-xs leading-relaxed"
                          style={{
                            background: 'var(--accent)', color: 'var(--text-inv)',
                            borderBottomRightRadius: 4, fontWeight: 300,
                          }}
                        >
                          {msg.text}
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* Agent label */}
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,126,116,0.10)' }}>
                              <IconAgent />
                            </div>
                            <span className="text-[9px] tracking-wider uppercase" style={{ color: 'var(--text-3)' }}>
                              {drawerMode === 'local' ? '本地知识库' : '联网辅助'}
                            </span>
                          </div>

                          {/* Answer text */}
                          <div
                            className="px-3.5 py-3 rounded-xl text-xs leading-[1.9]"
                            style={{
                              background: 'var(--bg-2)', border: '1px solid var(--line)',
                              color: 'var(--text-2)', borderBottomLeftRadius: 4,
                              fontWeight: 300, whiteSpace: 'pre-wrap',
                            }}
                          >
                            {msg.text}
                          </div>

                          {/* Related cards */}
                          {msg.cards && msg.cards.length > 0 && (
                            <div className="space-y-1.5 mt-2">
                              <p className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-3)' }}>相关卡片</p>
                              {msg.cards.map(card => (
                                <button
                                  key={card.id}
                                  onClick={() => handleCardClick(card.id)}
                                  className="w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200"
                                  style={{
                                    background: 'var(--surface)', border: '1px solid var(--line)',
                                    cursor: 'pointer', fontFamily: 'inherit',
                                  }}
                                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
                                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
                                >
                                  <p className="text-[9px] tracking-wider mb-1" style={{ color: 'var(--text-3)' }}>
                                    {card.sourceIcon} {card.sourcePlatform} · {formatRelativeTime(card.createdAt)}
                                  </p>
                                  <p className="text-[11px] font-light line-clamp-1" style={{ color: 'var(--text-1)' }}>
                                    {card.title}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Thinking indicator */}
                  {isThinking && (
                    <div className="flex items-center gap-2 anim-fade">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(139,126,116,0.10)' }}>
                        <div className="processing-ring" style={{ width: 10, height: 10, borderWidth: 1 }} />
                      </div>
                      <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>正在思考…</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid var(--line)' }}>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSubmit() }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="问一个关于你的知识的问题…"
                  className="m-input flex-1"
                  style={{ fontSize: 12, padding: '10px 14px', borderRadius: 10 }}
                  disabled={isThinking}
                />
                <button
                  type="submit"
                  disabled={!query.trim() || isThinking}
                  className="p-2.5 rounded-lg transition-all duration-200"
                  style={{
                    background: query.trim() ? 'var(--accent)' : 'var(--bg-2)',
                    color: query.trim() ? 'var(--text-inv)' : 'var(--text-3)',
                    border: 'none',
                    cursor: query.trim() ? 'pointer' : 'not-allowed',
                    flexShrink: 0,
                  }}
                >
                  <IconSend />
                </button>
              </form>
              <p className="text-[9px] mt-2 text-center" style={{ color: 'var(--text-3)', opacity: 0.6 }}>
                ⌘K 快速打开 · Esc 关闭
              </p>
            </div>
          </>
        )}
      </div>
    </>
  )
}

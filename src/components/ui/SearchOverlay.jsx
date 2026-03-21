import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { filterCards } from '../../utils/helpers'

export function SearchOverlay() {
  const { searchOpen, closeSearch, cards } = useStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  if (!searchOpen) return null

  const results = q.trim() ? filterCards(cards.filter(c => c.status === 'done'), [], q).slice(0, 8) : []

  const go = (id) => {
    navigate(`/space/card/${id}`)
    closeSearch()
    setQ('')
  }

  const highlight = (text, query) => {
    if (!query || !text) return text
    const idx = text.toLowerCase().indexOf(query.toLowerCase())
    if (idx === -1) return text.slice(0, 80)
    const start = Math.max(0, idx - 20)
    const end = Math.min(text.length, idx + query.length + 40)
    const pre = text.slice(start, idx)
    const match = text.slice(idx, idx + query.length)
    const post = text.slice(idx + query.length, end)
    return <span>{start > 0 && '…'}{pre}<mark style={{ background: 'var(--accent-pale)', color: 'var(--accent)', borderRadius: 3, padding: '0 2px' }}>{match}</mark>{post}{end < text.length && '…'}</span>
  }

  return (
    <div className="modal-overlay items-start pt-24" onClick={(e) => e.target === e.currentTarget && closeSearch()}>
      <div className="glass-card w-full max-w-xl mx-4 animate-slide-in overflow-hidden" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--text-ghost)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            placeholder="搜索卡片、标签、内容…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--text-primary)', fontFamily: 'inherit', fontWeight: 300 }}
          />
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-deep)', color: 'var(--text-ghost)' }}>Esc</span>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {results.length > 0 ? results.map((card) => (
            <button
              key={card.id}
              onClick={() => go(card.id)}
              className="w-full text-left px-4 py-3 transition-colors hover:bg-[var(--bg-deep)] flex items-start gap-3"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <span className="text-lg mt-0.5 flex-shrink-0">{card.sourceIcon}</span>
              <div className="min-w-0">
                <div className="text-sm font-medium mb-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                  {highlight(card.title, q)}
                </div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-ghost)' }}>
                  {highlight(card.summary?.coreIdea || '', q)}
                </div>
              </div>
            </button>
          )) : q.trim() ? (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-ghost)' }}>
              未找到与「{q}」相关的内容
            </div>
          ) : (
            <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-ghost)' }}>
              输入关键词，搜索你的资产库
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

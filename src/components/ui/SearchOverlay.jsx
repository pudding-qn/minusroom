import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { filterCards } from '../../utils/helpers'

export function SearchOverlay() {
  const { searchOpen, closeSearch, cards } = useStore()
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  if (!searchOpen) return null

  const results = q.trim()
    ? filterCards(cards.filter(c => c.status === 'done'), [], q).slice(0, 7)
    : []

  const go = (id) => { navigate(`/space/card/${id}`); closeSearch(); setQ('') }

  const hl = (text, query) => {
    if (!query || !text) return (text || '').slice(0, 80)
    const i = text.toLowerCase().indexOf(query.toLowerCase())
    if (i === -1) return text.slice(0, 80)
    const s = Math.max(0, i - 20), e = Math.min(text.length, i + query.length + 40)
    return (
      <>
        {s > 0 && '…'}
        {text.slice(s, i)}
        <mark style={{ background: 'rgba(139,126,116,0.20)', color: 'var(--accent)', borderRadius: 2, padding: '0 1px' }}>
          {text.slice(i, i + query.length)}
        </mark>
        {text.slice(i + query.length, e)}
        {e < text.length && '…'}
      </>
    )
  }

  return (
    <div
      className="m-overlay"
      style={{ alignItems: 'flex-start', paddingTop: '18vh' }}
      onClick={(e) => e.target === e.currentTarget && closeSearch()}
    >
      <div
        className="anim-drift w-full max-w-lg mx-6 overflow-hidden"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Input */}
        <div
          className="flex items-center gap-3 px-5 py-4"
          style={{ borderBottom: results.length > 0 ? '1px solid var(--line)' : 'none' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" style={{ color: 'var(--text-3)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
          </svg>
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && closeSearch()}
            placeholder="在你的房间里搜索…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 14,
              fontWeight: 400,
              color: 'var(--text-1)',
              fontFamily: 'Geist, sans-serif',
              letterSpacing: '0.01em',
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--bg-2)',
              color: 'var(--text-3)',
              border: '1px solid var(--line)',
              letterSpacing: '0.05em',
              fontFamily: 'inherit',
            }}
          >
            esc
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 340, overflowY: 'auto' }}>
          {results.length > 0
            ? results.map((card, i) => (
              <button
                key={card.id}
                onClick={() => go(card.id)}
                className={`anim-fade delay-${Math.min(i + 1, 5)} w-full text-left flex items-start gap-4 px-5 py-3.5 transition-all duration-200`}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit',
                  borderBottom: i < results.length - 1 ? '1px solid var(--line-2)' : 'none',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                <span style={{ color: 'var(--accent)', fontSize: 13, marginTop: 2, flexShrink: 0 }}>{card.sourceIcon}</span>
                <div className="min-w-0">
                  <div className="text-sm font-normal mb-0.5 truncate" style={{ color: 'var(--text-1)', fontWeight: 400 }}>
                    {hl(card.title, q)}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    {hl(card.summary?.coreIdea || '', q)}
                  </div>
                </div>
              </button>
            ))
            : q.trim()
              ? (
                <div className="px-5 py-10 text-center text-xs font-light tracking-wide" style={{ color: 'var(--text-3)' }}>
                  无结果 —— 试试其他关键词
                </div>
              )
              : (
                <div className="px-5 py-10 text-center text-xs font-light tracking-[0.1em] uppercase" style={{ color: 'var(--text-3)' }}>
                  输入以搜索你的资产库
                </div>
              )
          }
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useStore from '../store/useStore'
import { getAllTags, formatRelativeTime } from '../utils/helpers'

const Label = ({ children }) => (
  <p className="text-[9px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
    {children}
  </p>
)

export function TagsPage() {
  const { cards, updateCard, addToast } = useStore()
  const [searchParams] = useSearchParams()
  const initialTag = searchParams.get('selected')
  const [selected, setSelected] = useState(initialTag)

  // Sync with URL changes (e.g. breadcrumb navigation back to tags with ?selected=)
  useEffect(() => {
    const tag = searchParams.get('selected')
    if (tag) setSelected(tag)
  }, [searchParams])
  const [renamingTag, setRenamingTag] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()

  const allTags = getAllTags(cards)
  const filteredCards = selected
    ? cards.filter(c => c.tags?.includes(selected) && c.status === 'done')
    : []

  const handleRename = (oldTag) => {
    const t = renameVal.trim()
    if (!t || t === oldTag) { setRenamingTag(null); return }
    cards.forEach(c => {
      if (c.tags?.includes(oldTag)) updateCard(c.id, { tags: c.tags.map(x => x === oldTag ? t : x) })
    })
    if (selected === oldTag) setSelected(t)
    setRenamingTag(null)
    addToast({ message: `已重命名为「${t}」` })
  }

  const handleDeleteTag = (tag) => {
    cards.forEach(c => {
      if (c.tags?.includes(tag)) updateCard(c.id, { tags: c.tags.filter(x => x !== tag) })
    })
    if (selected === tag) setSelected(null)
    setConfirmDelete(null)
    addToast({ message: `标签已移除` })
  }

  return (
    <div className="flex h-full">
      {/* Left sidebar */}
      <aside
        className="w-52 flex-shrink-0 flex flex-col h-full overflow-y-auto"
        style={{ borderRight: '1px solid var(--line)' }}
      >
        <div className="px-5 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--line)' }}>
          <p className="font-display text-base" style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}>
            标签库
          </p>
          <p className="text-[9px] tracking-[0.12em] uppercase mt-1" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
            {allTags.length} 个标签 · {cards.length} 张卡片
          </p>
        </div>

        <div className="flex-1 p-3 overflow-y-auto">
          {allTags.length === 0 ? (
            <p className="text-[11px] text-center py-8 font-light" style={{ color: 'var(--text-3)' }}>
              还没有标签
            </p>
          ) : allTags.map(({ tag, count }) => (
            <div
              key={tag}
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg mb-0.5 cursor-pointer transition-all duration-200"
              style={{
                background: selected === tag ? 'var(--bg-2)' : 'transparent',
                color: selected === tag ? 'var(--text-1)' : 'var(--text-2)',
              }}
              onClick={() => setSelected(selected === tag ? null : tag)}
              onMouseEnter={e => { if (selected !== tag) e.currentTarget.style.background = 'var(--bg-2)' }}
              onMouseLeave={e => { if (selected !== tag) e.currentTarget.style.background = 'transparent' }}
            >
              {renamingTag === tag ? (
                <form onSubmit={e => { e.preventDefault(); handleRename(tag) }} onClick={e => e.stopPropagation()}>
                  <input
                    autoFocus
                    value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={() => handleRename(tag)}
                    style={{
                      fontSize: 12, fontWeight: 400,
                      background: 'var(--bg-3)',
                      border: '1px solid var(--accent)',
                      borderRadius: 4, padding: '2px 6px',
                      color: 'var(--text-1)', outline: 'none',
                      fontFamily: 'inherit', width: 100,
                    }}
                  />
                </form>
              ) : (
                <span className="text-xs font-light truncate">{tag}</span>
              )}
              <div className="flex items-center gap-1">
                <span className="text-[9px]" style={{ color: 'var(--text-3)', opacity: 0.7 }}>{count}</span>
                <div className="hidden group-hover:flex items-center gap-0.5 ml-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => { setRenamingTag(tag); setRenameVal(tag) }}
                    className="p-1 rounded transition-opacity opacity-40 hover:opacity-90"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
                    title="重命名"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(tag)}
                    className="p-1 rounded transition-opacity opacity-40 hover:opacity-90"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A06060' }}
                    title="删除"
                  >
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto px-7 py-6">
        {selected ? (
          <div className="anim-fade">
            <div className="mb-6">
              <h3
                className="font-display text-xl mb-1"
                style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}
              >
                {selected}
              </h3>
              <p className="text-[9px] tracking-[0.12em] uppercase" style={{ color: 'var(--text-3)' }}>
                {filteredCards.length} 张卡片
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredCards.map((card, i) => (
                <div
                  key={card.id}
                  className={`m-card p-4 cursor-pointer anim-fade delay-${Math.min(i + 1, 6)}`}
                  onClick={() => navigate(`/space/card/${card.id}?from=tags&tag=${encodeURIComponent(selected)}`)}
                >
                  <p className="text-[9px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-3)' }}>
                    {card.sourceIcon} {card.sourcePlatform} · {formatRelativeTime(card.createdAt)}
                  </p>
                  <p className="font-display text-sm leading-snug mb-2 line-clamp-2" style={{ color: 'var(--text-1)', fontWeight: 400 }}>
                    {card.title}
                  </p>
                  <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    {card.summary?.coreIdea}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full anim-fade">
            <div className="text-center">
              <p
                className="font-display text-3xl mb-2"
                style={{ color: 'var(--text-3)', fontWeight: 400, fontStyle: 'italic' }}
              >
                选择一个标签
              </p>
              <p className="text-xs font-light tracking-wide" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
                从左侧浏览你的标签维度
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="m-overlay" onClick={() => setConfirmDelete(null)}>
          <div
            className="anim-drift w-full max-w-sm mx-4"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-2" style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}>
              移除标签「{confirmDelete}」
            </h3>
            <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--text-3)', lineHeight: 1.9 }}>
              将从 {allTags.find(t => t.tag === confirmDelete)?.count || 0} 张卡片中移除此标签，卡片本身不受影响。
            </p>
            <div className="flex gap-2 justify-end">
              <button className="m-btn m-btn-ghost text-xs" style={{ padding: '8px 18px' }} onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="m-btn m-btn-danger text-xs" style={{ padding: '8px 18px' }} onClick={() => handleDeleteTag(confirmDelete)}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { getAllTags } from '../utils/helpers'
import { formatRelativeTime } from '../utils/helpers'

export function TagsPage() {
  const { cards, updateCard, addToast } = useStore()
  const [selected, setSelected] = useState(null)
  const [renamingTag, setRenamingTag] = useState(null)
  const [renameVal, setRenameVal] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const navigate = useNavigate()

  const allTags = getAllTags(cards)
  const filteredCards = selected
    ? cards.filter((c) => c.tags?.includes(selected) && c.status === 'done')
    : []

  const handleRename = (oldTag) => {
    const newTag = renameVal.trim()
    if (!newTag || newTag === oldTag) { setRenamingTag(null); return }
    cards.forEach((c) => {
      if (c.tags?.includes(oldTag)) {
        const newTags = c.tags.map((t) => (t === oldTag ? newTag : t))
        updateCard(c.id, { tags: newTags })
      }
    })
    if (selected === oldTag) setSelected(newTag)
    setRenamingTag(null)
    addToast({ message: `标签已重命名为「${newTag}」` })
  }

  const handleDeleteTag = (tag) => {
    cards.forEach((c) => {
      if (c.tags?.includes(tag)) {
        updateCard(c.id, { tags: c.tags.filter((t) => t !== tag) })
      }
    })
    if (selected === tag) setSelected(null)
    setConfirmDelete(null)
    addToast({ message: `标签「${tag}」已删除` })
  }

  const total = cards.length
  const tagCount = allTags.length

  return (
    <div className="flex h-full">
      {/* Left: tag list */}
      <aside className="w-60 flex-shrink-0 flex flex-col h-full overflow-y-auto" style={{ borderRight: '1px solid var(--border)' }}>
        <div className="px-4 py-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-sm font-medium mb-0.5" style={{ color: 'var(--text-primary)' }}>标签库</h2>
          <p className="text-xs font-light" style={{ color: 'var(--text-ghost)' }}>
            {tagCount} 个标签 · {total} 张卡片
          </p>
        </div>
        <div className="flex-1 p-3 overflow-y-auto">
          {allTags.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: 'var(--text-ghost)' }}>还没有标签</p>
          ) : (
            allTags.map(({ tag, count }) => (
              <div
                key={tag}
                className="group flex items-center justify-between px-3 py-2 rounded-xl mb-0.5 cursor-pointer transition-all"
                style={{
                  background: selected === tag ? 'var(--accent-pale)' : 'transparent',
                  color: selected === tag ? 'var(--accent)' : 'var(--text-secondary)',
                }}
                onClick={() => setSelected(selected === tag ? null : tag)}
                onMouseEnter={e => { if (selected !== tag) e.currentTarget.style.background = 'var(--bg-deep)' }}
                onMouseLeave={e => { if (selected !== tag) e.currentTarget.style.background = 'transparent' }}
              >
                {renamingTag === tag ? (
                  <form onSubmit={(e) => { e.preventDefault(); handleRename(tag) }} onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      value={renameVal}
                      onChange={(e) => setRenameVal(e.target.value)}
                      onBlur={() => handleRename(tag)}
                      className="text-xs outline-none rounded px-1 w-28"
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--accent)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                    />
                  </form>
                ) : (
                  <span className="text-sm truncate">{tag}</span>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-xs opacity-50">{count}</span>
                  <div className="hidden group-hover:flex items-center gap-0.5 ml-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => { setRenamingTag(tag); setRenameVal(tag) }}
                      className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
                      title="重命名"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      onClick={() => setConfirmDelete(tag)}
                      className="p-1 rounded opacity-50 hover:opacity-100 transition-opacity"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#C0392B' }}
                      title="删除标签"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4h6v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Right: cards */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {selected ? (
          <>
            <h3 className="text-base font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
              「{selected}」
              <span className="text-sm font-light ml-2" style={{ color: 'var(--text-ghost)' }}>{filteredCards.length} 张卡片</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  className="glass-card p-4 card-hover"
                  onClick={() => navigate(`/space/card/${card.id}`)}
                >
                  <p className="text-xs mb-2" style={{ color: 'var(--text-ghost)' }}>{card.sourceIcon} {card.sourcePlatform} · {formatRelativeTime(card.createdAt)}</p>
                  <p className="text-sm font-medium mb-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{card.title}</p>
                  <p className="text-xs font-light line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{card.summary?.coreIdea}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center animate-fade-up">
              <div className="text-4xl mb-4">🏷️</div>
              <p className="text-sm font-light" style={{ color: 'var(--text-ghost)' }}>选择左侧标签查看相关卡片</p>
            </div>
          </div>
        )}
      </div>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>删除标签「{confirmDelete}」</h3>
            <p className="text-sm font-light mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              该操作将从 {allTags.find(t => t.tag === confirmDelete)?.count || 0} 张卡片中移除此标签，卡片本身不受影响。
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>取消</button>
              <button className="btn-danger" onClick={() => handleDeleteTag(confirmDelete)}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

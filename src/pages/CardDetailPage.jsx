import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { formatRelativeTime, getRelatedCards } from '../utils/helpers'

export function CardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cards, updateCard, deleteCard, addToast } = useStore()
  const card = cards.find((c) => c.id === id)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [noteVal, setNoteVal] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [relatedOffset, setRelatedOffset] = useState(0)

  useEffect(() => {
    if (card) {
      setTitleVal(card.title)
      setNoteVal(card.note || '')
      updateCard(id, { lastViewedAt: new Date().toISOString() })
    }
  }, [id])

  if (!card) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-sm mb-3" style={{ color: 'var(--text-ghost)' }}>卡片不存在或已被删除</p>
        <button className="btn-ghost" onClick={() => navigate('/space')}>返回我的空间</button>
      </div>
    </div>
  )

  const related = getRelatedCards(cards, id, 4)
  const shownRelated = related.slice(relatedOffset, relatedOffset + 4)

  const saveTitle = () => {
    if (titleVal.trim()) updateCard(id, { title: titleVal.trim() })
    setEditingTitle(false)
  }

  const saveNote = () => {
    updateCard(id, { note: noteVal })
    setEditingNote(false)
    addToast({ message: '备注已保存' })
  }

  const removeTag = (tag) => {
    updateCard(id, { tags: card.tags.filter((t) => t !== tag) })
  }

  const addTag = (e) => {
    e.preventDefault()
    const t = newTag.trim()
    if (t && !card.tags?.includes(t)) {
      updateCard(id, { tags: [...(card.tags || []), t] })
    }
    setNewTag('')
    setShowTagInput(false)
  }

  const handleDelete = () => {
    deleteCard(id)
    addToast({ message: '卡片已删除' })
    navigate('/space')
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-6 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-6" style={{ color: 'var(--text-ghost)' }}>
        <Link to="/space" style={{ color: 'var(--text-ghost)', textDecoration: 'none' }} className="hover:text-[var(--accent)] transition-colors">
          我的空间
        </Link>
        <span>›</span>
        <span className="truncate max-w-xs" style={{ color: 'var(--text-secondary)' }}>{card.title}</span>
      </div>

      {/* Title */}
      <div className="mb-4">
        {editingTitle ? (
          <input
            autoFocus
            className="input-field text-xl font-medium"
            value={titleVal}
            onChange={(e) => setTitleVal(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
            style={{ fontSize: 20, fontWeight: 500, padding: '8px 12px' }}
          />
        ) : (
          <h1
            className="text-xl font-medium leading-snug cursor-text"
            style={{ color: 'var(--text-primary)' }}
            onClick={() => setEditingTitle(true)}
            title="点击编辑标题"
          >
            {card.title}
          </h1>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-6 text-xs" style={{ color: 'var(--text-ghost)' }}>
        <span>{card.sourceIcon} {card.sourcePlatform}</span>
        <span>·</span>
        <span>{formatRelativeTime(card.createdAt)}</span>
        {card.sourceUrl && (
          <>
            <span>·</span>
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 transition-colors"
              style={{ color: 'var(--text-ghost)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-ghost)'}
            >
              查看原文
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </a>
          </>
        )}
      </div>

      {/* AI Summary */}
      {card.status === 'processing' ? (
        <div className="ai-section mb-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--accent)' }}>AI 正在整理内容…</span>
          </div>
          <div className="shimmer-bg h-4 rounded-lg mb-2 w-4/5" />
          <div className="shimmer-bg h-3 rounded-lg mb-1.5 w-full" />
          <div className="shimmer-bg h-3 rounded-lg w-2/3" />
        </div>
      ) : card.status === 'failed' ? (
        <div className="ai-section mb-5" style={{ borderColor: 'rgba(192,57,43,0.2)' }}>
          <p className="text-xs" style={{ color: '#C0392B' }}>AI 处理失败，以下为原始采集内容</p>
        </div>
      ) : card.summary ? (
        <div className="ai-section mb-5 relative">
          <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(107,127,106,0.15)', color: 'var(--accent)' }}>
            AI 生成
          </div>

          {/* Core idea */}
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--accent)', opacity: 0.7 }}>核心观点</p>
            <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
              {card.summary.coreIdea}
            </p>
          </div>

          {/* Key points */}
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--accent)', opacity: 0.7 }}>关键信息</p>
            <ul className="space-y-2">
              {card.summary.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-light leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--accent)', opacity: 0.6 }} />
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          {card.summary.quote && (
            <blockquote
              className="text-sm font-light leading-relaxed pl-4 italic"
              style={{
                borderLeft: '2px solid var(--accent)',
                color: 'var(--text-secondary)',
                opacity: 0.9,
              }}
            >
              {card.summary.quote}
            </blockquote>
          )}
        </div>
      ) : null}

      {/* Tags */}
      <div className="mb-5">
        <p className="text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-ghost)' }}>标签</p>
        <div className="flex flex-wrap gap-2 items-center">
          {(card.tags || []).map((tag) => (
            <span key={tag} className="tag-pill active" style={{ cursor: 'default' }}>
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', opacity: 0.7, padding: 0, lineHeight: 1, marginLeft: 2 }}
              >×</button>
            </span>
          ))}
          {showTagInput ? (
            <form onSubmit={addTag} className="flex items-center gap-1">
              <input
                autoFocus
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onBlur={() => { if (!newTag.trim()) setShowTagInput(false) }}
                placeholder="输入标签…"
                className="text-xs px-2 py-1 rounded-lg outline-none"
                style={{
                  background: 'var(--bg-deep)',
                  border: '1px solid var(--accent)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  width: 100,
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="tag-pill"
              style={{ opacity: 0.6, border: '1px dashed var(--accent)' }}
            >
              + 添加标签
            </button>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider mb-2.5" style={{ color: 'var(--text-ghost)' }}>我的备注</p>
        {editingNote ? (
          <div>
            <textarea
              autoFocus
              className="input-field resize-none mb-2"
              rows={4}
              value={noteVal}
              onChange={(e) => setNoteVal(e.target.value)}
              placeholder="记录你的想法、解读、使用场景…"
              style={{ lineHeight: 1.7 }}
            />
            <div className="flex gap-2">
              <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={saveNote}>保存</button>
              <button className="btn-ghost" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => { setEditingNote(false); setNoteVal(card.note || '') }}>取消</button>
            </div>
          </div>
        ) : (
          <div
            className="text-sm font-light leading-relaxed cursor-text rounded-xl px-4 py-3 transition-all"
            style={{
              color: noteVal ? 'var(--text-secondary)' : 'var(--text-ghost)',
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              minHeight: 48,
            }}
            onClick={() => setEditingNote(true)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            {noteVal || '添加你的想法…'}
          </div>
        )}
      </div>

      {/* Delete */}
      <div className="pb-4 border-t pt-5" style={{ borderColor: 'var(--border)' }}>
        <button className="btn-danger" style={{ fontSize: 13 }} onClick={() => setShowDeleteModal(true)}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          删除卡片
        </button>
      </div>

      {/* Related */}
      {cards.filter(c => c.status === 'done').length >= 10 && shownRelated.length > 0 && (
        <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>相关内容</p>
            {related.length > 4 && (
              <button
                className="text-xs transition-colors"
                style={{ color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={() => setRelatedOffset((relatedOffset + 4) % related.length)}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-ghost)'}
              >
                换一批 →
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {shownRelated.map((r) => (
              <div
                key={r.id}
                className="glass-card p-4 card-hover"
                onClick={() => { navigate(`/space/card/${r.id}`); window.scrollTo(0, 0) }}
              >
                <p className="text-xs mb-1.5" style={{ color: 'var(--text-ghost)' }}>{r.sourceIcon} {r.sourcePlatform}</p>
                <p className="text-sm font-medium mb-1.5 line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>{r.title}</p>
                <p className="text-xs font-light line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.summary?.coreIdea}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>确认删除</h3>
            <p className="text-sm font-light mb-5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              删除后无法恢复，确定要删除这张卡片吗？
            </p>
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>取消</button>
              <button className="btn-danger" onClick={handleDelete}>确认删除</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom'
import useStore from '../store/useStore'
import { formatRelativeTime, getRelatedCards } from '../utils/helpers'

/* ── Section label ── */
const Label = ({ children }) => (
  <p
    className="text-[9px] tracking-[0.18em] uppercase mb-3"
    style={{ color: 'var(--text-3)', fontWeight: 400 }}
  >
    {children}
  </p>
)

/* ── Divider ── */
const Divider = () => (
  <div className="my-7" style={{ borderTop: '1px solid var(--line)' }} />
)

export function CardDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromTags = searchParams.get('from') === 'tags'
  const fromTag = searchParams.get('tag') || ''
  const { cards, updateCard, deleteCard, addToast } = useStore()
  const card = cards.find(c => c.id === id)

  // Scroll to top when card changes (e.g. navigating from Agent drawer)
  useEffect(() => {
    const mainEl = document.getElementById('main-scroll')
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleVal, setTitleVal] = useState('')
  const [editingNote, setEditingNote] = useState(false)
  const [noteVal, setNoteVal] = useState('')
  const [newTag, setNewTag] = useState('')
  const [showTagInput, setShowTagInput] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    if (card) {
      setTitleVal(card.title)
      setNoteVal(card.note || '')
      updateCard(id, { lastViewedAt: new Date().toISOString() })
    }
  }, [id])

  if (!card) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center anim-fade">
        <p className="text-sm font-normal mb-4" style={{ color: 'var(--text-3)' }}>卡片不存在</p>
        <button className="m-btn m-btn-ghost text-xs" onClick={() => navigate('/space')}>
          返回
        </button>
      </div>
    </div>
  )

  const related = getRelatedCards(cards, id, 20)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 4
  const totalPages = Math.ceil(related.length / PAGE_SIZE)
  const isLastPage = page >= totalPages - 1

  const shownRelated = related.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  // Reset page when navigating to different card
  useEffect(() => { setPage(0) }, [id])

  const saveTitle = () => {
    if (titleVal.trim()) updateCard(id, { title: titleVal.trim() })
    setEditingTitle(false)
  }
  const saveNote = () => {
    updateCard(id, { note: noteVal })
    setEditingNote(false)
    addToast({ message: '备注已更新' })
  }
  const removeTag = (tag) => {
    updateCard(id, { tags: card.tags.filter(t => t !== tag) })
  }
  const addTag = (e) => {
    e.preventDefault()
    const t = newTag.trim()
    if (t && !card.tags?.includes(t)) updateCard(id, { tags: [...(card.tags || []), t] })
    setNewTag(''); setShowTagInput(false)
  }
  const handleDelete = () => {
    setExiting(true)
    setTimeout(() => {
      deleteCard(id)
      addToast({ message: '卡片已散去' })
      navigate('/space')
    }, 500)
  }

  return (
    <div
      className={`max-w-2xl mx-auto px-8 py-8 anim-drift ${exiting ? 'anim-dust' : ''}`}
      style={{ transition: 'opacity 0.5s ease' }}
    >
      {/* Breadcrumb — adapts to navigation source */}
      <div className="flex items-center gap-2 mb-8">
        {fromTags ? (
          <>
            <Link
              to="/tags"
              className="text-[10px] tracking-[0.12em] uppercase transition-colors duration-200"
              style={{ color: 'var(--text-3)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              标签库
            </Link>
            {fromTag && (
              <>
                <span style={{ color: 'var(--text-3)', fontSize: 10 }}>›</span>
                <Link
                  to={`/tags?selected=${encodeURIComponent(fromTag)}`}
                  className="text-[10px] tracking-[0.10em] transition-colors duration-200"
                  style={{ color: 'var(--text-3)', textDecoration: 'none' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                >
                  {fromTag}
                </Link>
              </>
            )}
          </>
        ) : (
          <Link
            to="/space"
            className="text-[10px] tracking-[0.12em] uppercase transition-colors duration-200"
            style={{ color: 'var(--text-3)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >
            我的空间
          </Link>
        )}
        <span style={{ color: 'var(--text-3)', fontSize: 10 }}>›</span>
        <span
          className="text-[10px] tracking-wide truncate max-w-xs"
          style={{ color: 'var(--text-2)' }}
        >
          {card.title}
        </span>
      </div>

      {/* Title */}
      <div className="mb-5">
        {editingTitle ? (
          <input
            autoFocus
            className="m-input font-display"
            value={titleVal}
            onChange={e => setTitleVal(e.target.value)}
            onBlur={saveTitle}
            onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
            style={{ fontSize: 22, fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.01em', padding: '8px 12px' }}
          />
        ) : (
          <h1
            className="font-display cursor-text"
            style={{
              fontSize: 24,
              fontWeight: 400,
              fontStyle: 'italic',
              letterSpacing: '-0.01em',
              lineHeight: 1.35,
              color: 'var(--text-1)',
            }}
            onClick={() => setEditingTitle(true)}
          >
            {card.title}
          </h1>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 mb-8 flex-wrap">
        <span className="text-[10px] tracking-wider" style={{ color: 'var(--accent)' }}>
          {card.sourceIcon}
        </span>
        <span className="text-[10px] tracking-[0.08em] uppercase" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          {card.sourcePlatform}
        </span>
        <span style={{ color: 'var(--line)', fontSize: 8 }}>●</span>
        <span className="text-[10px]" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          {formatRelativeTime(card.createdAt)}
        </span>
        {card.sourceUrl && (
          <>
            <span style={{ color: 'var(--line)', fontSize: 8 }}>●</span>
            <a
              href={card.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] tracking-[0.06em] uppercase transition-colors duration-200"
              style={{ color: 'var(--text-3)', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
            >
              原文 ↗
            </a>
          </>
        )}
      </div>

      {/* AI Summary */}
      {card.status === 'processing' ? (
        <div className="ai-zone mb-7">
          <div className="flex items-center gap-2.5 mb-4">
            <span className="processing-ring" />
            <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'var(--accent)', fontWeight: 400 }}>
              AI 整理中
            </span>
          </div>
          <div className="m-shimmer h-3 w-4/5 mb-2" />
          <div className="m-shimmer h-2.5 w-full mb-1.5" />
          <div className="m-shimmer h-2.5 w-3/5" />
        </div>
      ) : card.summary ? (
        <div className="ai-zone mb-7 relative">
          <div
            className="absolute top-4 right-4 text-[9px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--text-3)', fontWeight: 400 }}
          >
            AI 生成
          </div>

          {/* Core idea */}
          <div className="mb-5 pr-10">
            <Label>核心观点</Label>
            <p
              className="font-display text-lg leading-relaxed"
              style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic', lineHeight: 1.6 }}
            >
              {card.summary.coreIdea}
            </p>
          </div>

          {/* Key points */}
          <div className="mb-5">
            <Label>关键信息</Label>
            <ul className="space-y-2.5">
              {card.summary.keyPoints.map((pt, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-xs font-light leading-relaxed"
                  style={{ color: 'var(--text-2)', lineHeight: 1.8 }}
                >
                  <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 6, fontSize: 6 }}>●</span>
                  {pt}
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          {card.summary.quote && (
            <div>
              <Label>原文金句</Label>
              <blockquote
                className="text-sm font-normal leading-relaxed pl-4"
                style={{
                  borderLeft: '2px solid var(--accent)',
                  color: 'var(--text-2)',
                  fontStyle: 'italic',
                  lineHeight: 1.8,
                  opacity: 0.85,
                }}
              >
                {card.summary.quote}
              </blockquote>
            </div>
          )}
        </div>
      ) : card.status === 'failed' ? (
        <div
          className="mb-7 p-5 rounded-xl text-xs font-light"
          style={{ background: 'rgba(160,96,96,0.06)', border: '1px solid rgba(160,96,96,0.15)', color: '#A06060' }}
        >
          AI 处理失败，仅保存了原始采集内容
        </div>
      ) : null}

      <Divider />

      {/* Tags */}
      <div className="mb-7">
        <Label>标签</Label>
        <div className="flex flex-wrap gap-2 items-center">
          {(card.tags || []).map(tag => (
            <span key={tag} className="m-tag active">
              {tag}
              <button
                onClick={() => removeTag(tag)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'inherit', opacity: 0.6, padding: 0, lineHeight: 1,
                  marginLeft: 2, fontSize: 11,
                }}
              >×</button>
            </span>
          ))}
          {showTagInput ? (
            <form onSubmit={addTag}>
              <input
                autoFocus
                value={newTag}
                onChange={e => setNewTag(e.target.value)}
                onBlur={() => { if (!newTag.trim()) setShowTagInput(false) }}
                placeholder="输入标签…"
                style={{
                  fontSize: 11, padding: '3px 10px', borderRadius: 99,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--accent)',
                  color: 'var(--text-1)',
                  outline: 'none', fontFamily: 'inherit', width: 90,
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="m-tag"
              style={{ opacity: 0.5, borderStyle: 'dashed' }}
            >
              + 添加
            </button>
          )}
        </div>
      </div>

      <Divider />

      {/* Note */}
      <div className="mb-7">
        <Label>我的备注</Label>
        {editingNote ? (
          <div>
            <textarea
              autoFocus
              className="m-input resize-none mb-3"
              rows={5}
              value={noteVal}
              onChange={e => setNoteVal(e.target.value)}
              placeholder="记录你的想法、解读、使用场景…"
              style={{ fontSize: 13, fontWeight: 400, lineHeight: 1.9 }}
            />
            <div className="flex gap-2">
              <button className="m-btn m-btn-primary text-xs" style={{ padding: '7px 16px' }} onClick={saveNote}>
                保存
              </button>
              <button
                className="m-btn m-btn-ghost text-xs"
                style={{ padding: '7px 16px' }}
                onClick={() => { setEditingNote(false); setNoteVal(card.note || '') }}
              >
                取消
              </button>
            </div>
          </div>
        ) : (
          <div
            className="text-sm font-normal leading-relaxed cursor-text rounded-xl px-4 py-3.5 transition-all duration-300"
            style={{
              color: noteVal ? 'var(--text-2)' : 'var(--text-3)',
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              minHeight: 52,
              lineHeight: 1.9,
              fontWeight: 400,
            }}
            onClick={() => setEditingNote(true)}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,126,116,0.30)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
          >
            {noteVal || '添加你的想法…'}
          </div>
        )}
      </div>

      {/* Delete */}
      <Divider />
      <button
        className="m-btn m-btn-danger text-xs"
        style={{ fontSize: 11, padding: '7px 16px', letterSpacing: '0.04em' }}
        onClick={() => setShowDeleteModal(true)}
      >
        删除卡片
      </button>

      {/* Related */}
      {cards.filter(c => c.status === 'done').length >= 10 && shownRelated.length > 0 && (
        <>
          <Divider />
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-baseline gap-3">
                <Label>相关内容</Label>
                <span className="text-[9px] tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
                  {related.length} 张相关
                </span>
              </div>
              <div className="flex items-center gap-3">
                {totalPages > 1 && (
                  <>
                    {page > 0 && (
                      <button
                        className="text-[9px] tracking-[0.12em] uppercase transition-colors duration-200"
                        style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => setPage(p => p - 1)}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        ← 上一页
                      </button>
                    )}
                    <span className="text-[9px] tracking-[0.08em]" style={{ color: 'var(--text-3)' }}>
                      {page + 1} / {totalPages}
                    </span>
                    {!isLastPage && (
                      <button
                        className="text-[9px] tracking-[0.12em] uppercase transition-colors duration-200"
                        style={{ color: 'var(--text-3)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                        onClick={() => setPage(p => p + 1)}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
                      >
                        下一页 →
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {shownRelated.map((r, i) => (
                <div
                  key={r.id}
                  className={`m-card p-4 cursor-pointer anim-fade delay-${i + 1}`}
                  onClick={() => { navigate(`/space/card/${r.id}`); document.getElementById('main-scroll')?.scrollTo({ top: 0, behavior: 'smooth' }) }}
                >
                  <p className="text-[9px] tracking-wider uppercase mb-2" style={{ color: 'var(--text-3)' }}>
                    {r.sourceIcon} {r.sourcePlatform}
                  </p>
                  <p className="font-display text-sm leading-snug mb-2 line-clamp-2" style={{ color: 'var(--text-1)', fontWeight: 400 }}>
                    {r.title}
                  </p>
                  <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--text-3)' }}>
                    {r.summary?.coreIdea}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="m-overlay" onClick={() => setShowDeleteModal(false)}>
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
            <h3
              className="font-display text-lg mb-2"
              style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}
            >
              删除这张卡片？
            </h3>
            <p className="text-xs leading-relaxed mb-6" style={{ color: 'var(--text-3)', lineHeight: 1.9 }}>
              卡片将如尘埃般消散，无法恢复。
            </p>
            <div className="flex gap-2 justify-end">
              <button className="m-btn m-btn-ghost text-xs" style={{ padding: '8px 18px' }} onClick={() => setShowDeleteModal(false)}>
                取消
              </button>
              <button className="m-btn m-btn-danger text-xs" style={{ padding: '8px 18px' }} onClick={handleDelete}>
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

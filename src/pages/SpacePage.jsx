import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { getAllTags, filterCards, formatRelativeTime } from '../utils/helpers'

// Card skeleton for processing state
function CardSkeleton({ card }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3 opacity-60">
      <div className="flex items-center gap-2">
        <span className="text-base">{card.sourceIcon}</span>
        <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>{card.sourcePlatform}</span>
      </div>
      <div className="shimmer-bg h-4 rounded-lg w-3/4" />
      <div className="shimmer-bg h-3 rounded-lg w-full" />
      <div className="shimmer-bg h-3 rounded-lg w-2/3" />
      <div className="flex items-center gap-2 mt-1">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--accent)' }} />
        <span className="text-xs font-light" style={{ color: 'var(--accent)' }}>AI 整理中…</span>
      </div>
    </div>
  )
}

// Card component
function CardItem({ card }) {
  const navigate = useNavigate()
  if (card.status === 'processing') return <CardSkeleton card={card} />
  return (
    <div
      className="glass-card card-hover p-5 flex flex-col gap-3"
      style={{ boxShadow: '0 2px 16px rgba(44,44,42,0.06)' }}
      onClick={() => navigate(`/space/card/${card.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">{card.sourceIcon}</span>
          <span className="text-xs truncate" style={{ color: 'var(--text-ghost)' }}>{card.sourcePlatform}</span>
        </div>
        <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-ghost)' }}>{formatRelativeTime(card.createdAt)}</span>
      </div>
      <h3 className="text-sm font-medium leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
        {card.title}
      </h3>
      {card.summary && (
        <p className="text-xs font-light leading-relaxed line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
          {card.summary.coreIdea}
        </p>
      )}
      {card.tags && card.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {card.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag-pill" style={{ fontSize: 11 }}>{tag}</span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>+{card.tags.length - 3}</span>
          )}
        </div>
      )}
    </div>
  )
}

// Daily Digest strip
function DigestStrip({ cards, onDismiss }) {
  const navigate = useNavigate()
  return (
    <div className="mb-6 animate-fade-up">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>今日回顾</span>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-pale)', color: 'var(--accent)' }}>
            {cards.length} 张
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-xs transition-opacity hover:opacity-70"
          style={{ color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          关闭 ×
        </button>
      </div>
      <div className="flex gap-3 overflow-x-auto tags-scroll pb-1">
        {cards.map((card) => (
          <div
            key={card.id}
            className="glass-card flex-shrink-0 w-60 p-4 card-hover"
            style={{ borderLeft: '3px solid var(--accent)', boxShadow: '0 4px 20px rgba(107,127,106,0.1)' }}
            onClick={() => navigate(`/space/card/${card.id}`)}
          >
            <p className="text-xs font-light mb-2 truncate" style={{ color: 'var(--text-ghost)' }}>
              {card.sourceIcon} {card.sourcePlatform}
            </p>
            <h4 className="text-sm font-medium mb-2 line-clamp-2 leading-snug" style={{ color: 'var(--text-primary)' }}>
              {card.title}
            </h4>
            <p className="text-xs font-light line-clamp-2 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {card.summary?.coreIdea}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function SpacePage() {
  const {
    cards,
    selectedTags,
    toggleTag,
    clearTags,
    digestDismissedDate,
    dismissDigest,
    isDigestVisible,
    digestCardIds,
    openCapture,
  } = useStore()

  const allTags = getAllTags(cards)
  const filtered = filterCards(cards, selectedTags, '')
  const digestCards = cards.filter((c) => digestCardIds.includes(c.id) && c.status === 'done')
  const showDigest = isDigestVisible() && digestCards.length > 0

  return (
    <div className="px-6 py-6 max-w-5xl mx-auto">
      {/* Digest */}
      {showDigest && <DigestStrip cards={digestCards} onDismiss={dismissDigest} />}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-6 tags-scroll">
          <button
            onClick={clearTags}
            className={`tag-pill flex-shrink-0 ${selectedTags.length === 0 ? 'active' : ''}`}
          >
            全部
          </button>
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`tag-pill flex-shrink-0 ${selectedTags.includes(tag) ? 'active' : ''}`}
            >
              {tag}
              <span className="opacity-60 text-[10px]">{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <EmptyState openCapture={openCapture} />
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {filtered.map((card) => (
            <div key={card.id} className="break-inside-avoid animate-fall-in">
              <CardItem card={card} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState({ openCapture }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-up">
      <div className="text-5xl mb-5 animate-float">🌿</div>
      <h2 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>你的房间还很安静</h2>
      <p className="text-sm font-light mb-1 max-w-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        粘贴一个链接，或输入一段文字，让 AI 帮你整理成精华卡片
      </p>
      <p className="text-xs mb-6" style={{ color: 'var(--text-ghost)' }}>
        粘贴链接 → AI 自动整理 → 定期唤醒
      </p>
      <button className="btn-primary" onClick={openCapture}>
        + 采集第一条内容
      </button>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { getAllTags, filterCards, formatRelativeTime } from '../utils/helpers'

/* ── Skeleton card while AI processes ── */
function SkeletonCard({ card }) {
  return (
    <div
      className="m-card p-5"
      style={{ opacity: 0.75 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'var(--accent)', fontSize: 11 }}>{card.sourceIcon}</span>
        <span className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
          {card.sourcePlatform}
        </span>
      </div>
      <div className="m-shimmer h-3.5 w-3/4 mb-2.5" />
      <div className="m-shimmer h-2.5 w-full mb-1.5" />
      <div className="m-shimmer h-2.5 w-2/3 mb-4" />
      <div className="flex items-center gap-2">
        <span className="processing-ring" style={{ width: 10, height: 10 }} />
        <span className="text-[10px] tracking-[0.1em] uppercase font-light" style={{ color: 'var(--accent)' }}>
          AI 整理中
        </span>
      </div>
    </div>
  )
}

/* ── Card item ── */
function CardItem({ card, index }) {
  const navigate = useNavigate()
  if (card.status === 'processing') return (
    <div className={`anim-dissolve delay-${Math.min(index + 1, 8)}`}>
      <SkeletonCard card={card} />
    </div>
  )

  return (
    <div
      className={`m-card p-5 cursor-pointer group anim-dissolve delay-${Math.min(index + 1, 8)}`}
      onClick={() => navigate(`/space/card/${card.id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span style={{ color: 'var(--accent)', fontSize: 11, flexShrink: 0 }}>{card.sourceIcon}</span>
          <span
            className="text-[10px] tracking-wider uppercase"
            style={{ color: 'var(--text-3)', fontWeight: 400, letterSpacing: '0.08em' }}
          >
            {card.sourcePlatform}
          </span>
        </div>
        <span className="text-[10px]" style={{ color: 'var(--text-3)', fontWeight: 400, flexShrink: 0 }}>
          {formatRelativeTime(card.createdAt)}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-display text-base leading-snug mb-3 line-clamp-2"
        style={{
          color: 'var(--text-1)',
          fontWeight: 400,
          letterSpacing: '-0.01em',
          transition: 'color 0.3s ease',
        }}
      >
        {card.title}
      </h3>

      {/* Core idea */}
      {card.summary && (
        <p
          className="text-xs leading-relaxed line-clamp-3 mb-4"
          style={{ color: 'var(--text-2)', lineHeight: 1.8 }}
        >
          {card.summary.coreIdea}
        </p>
      )}

      {/* Tags */}
      {card.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {card.tags.slice(0, 3).map(tag => (
            <span key={tag} className="m-tag" style={{ fontSize: 10, padding: '2px 8px' }}>
              {tag}
            </span>
          ))}
          {card.tags.length > 3 && (
            <span className="text-[10px]" style={{ color: 'var(--text-3)', alignSelf: 'center' }}>
              +{card.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Daily Digest ── */
function DigestStrip({ cards, onDismiss }) {
  const navigate = useNavigate()
  return (
    <div className="mb-10 anim-fade">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-baseline gap-3">
          <span
            className="font-display text-sm"
            style={{ color: 'var(--text-2)', fontStyle: 'italic', fontWeight: 400 }}
          >
            今日回顾
          </span>
          <span
            className="text-[10px] tracking-[0.12em] uppercase"
            style={{ color: 'var(--text-3)' }}
          >
            {cards.length} 张待阅
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[10px] tracking-wider uppercase transition-colors duration-200"
          style={{
            color: 'var(--text-3)',
            background: 'none', border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', letterSpacing: '0.1em',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
        >
          关闭
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {cards.map((card, i) => (
          <div
            key={card.id}
            className={`flex-shrink-0 w-56 cursor-pointer anim-fade delay-${i + 1}`}
            style={{
              background: 'var(--surface)',
              backdropFilter: 'blur(20px)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 18px',
              borderTop: '2px solid var(--accent)',
              transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1)',
            }}
            onClick={() => navigate(`/space/card/${card.id}`)}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <p
              className="text-[9px] tracking-[0.12em] uppercase mb-2"
              style={{ color: 'var(--text-3)', fontWeight: 400 }}
            >
              {card.sourceIcon} {card.sourcePlatform}
            </p>
            <h4
              className="font-display text-sm leading-snug mb-2 line-clamp-2"
              style={{ color: 'var(--text-1)', fontWeight: 400 }}
            >
              {card.title}
            </h4>
            <p
              className="text-[11px] leading-relaxed line-clamp-3"
              style={{ color: 'var(--text-2)' }}
            >
              {card.summary?.coreIdea}
            </p>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="mt-8 mb-2 flex items-center gap-4">
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
        <span
          className="text-[9px] tracking-[0.2em] uppercase"
          style={{ color: 'var(--text-3)' }}
        >
          全部资产
        </span>
        <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      </div>
    </div>
  )
}

/* ── Page ── */
export function SpacePage() {
  const {
    cards, selectedTags, toggleTag, clearTags,
    isDigestVisible, dismissDigest, digestCardIds, openCapture,
  } = useStore()

  const allTags = getAllTags(cards)
  const filtered = filterCards(cards, selectedTags, '')
  const digestCards = cards.filter(c => digestCardIds.includes(c.id) && c.status === 'done')
  const showDigest = isDigestVisible() && digestCards.length > 0

  return (
    <div className="px-7 pt-7 pb-16 max-w-5xl mx-auto">

      {showDigest && (
        <DigestStrip cards={digestCards} onDismiss={dismissDigest} />
      )}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-2 mb-7 overflow-x-auto no-scrollbar">
          <button
            onClick={clearTags}
            className={`m-tag flex-shrink-0 ${selectedTags.length === 0 ? 'active' : ''}`}
          >
            全部
          </button>
          {allTags.map(({ tag, count }) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`m-tag flex-shrink-0 ${selectedTags.includes(tag) ? 'active' : ''}`}
            >
              {tag}
              <span style={{ opacity: 0.5, fontSize: 9 }}>{count}</span>
            </button>
          ))}
        </div>
      )}

      {/* Card count */}
      {filtered.length > 0 && (
        <p
          className="text-[10px] tracking-[0.1em] uppercase mb-5"
          style={{ color: 'var(--text-3)', fontWeight: 400 }}
        >
          {filtered.length} 张卡片
          {selectedTags.length > 0 && ` · 筛选: ${selectedTags.join(', ')}`}
        </p>
      )}

      {/* Cards grid */}
      {filtered.length === 0
        ? <EmptyState openCapture={openCapture} />
        : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {filtered.map((card, i) => (
              <div key={card.id} className="break-inside-avoid">
                <CardItem card={card} index={i} />
              </div>
            ))}
          </div>
        )
      }
    </div>
  )
}

function EmptyState({ openCapture }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center anim-fade">
      <p
        className="font-display text-4xl mb-4"
        style={{ color: 'var(--text-3)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.02em' }}
      >
        空
      </p>
      <p
        className="text-sm font-normal mb-1.5"
        style={{ color: 'var(--text-2)', fontWeight: 400, lineHeight: 1.9 }}
      >
        这里还没有任何内容
      </p>
      <p
        className="text-xs mb-8 tracking-wide"
        style={{ color: 'var(--text-3)', fontWeight: 400 }}
      >
        粘贴链接 → AI 蒸馏 → 定期唤醒
      </p>
      <button className="m-btn m-btn-primary text-xs" onClick={openCapture} style={{ letterSpacing: '0.06em' }}>
        采集第一条
      </button>
    </div>
  )
}

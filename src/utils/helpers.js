export function formatRelativeTime(isoString) {
  if (!isoString) return ''
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins} 分钟前`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} 小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} 天前`
  const months = Math.floor(days / 30)
  return `${months} 个月前`
}

export function getAllTags(cards) {
  const map = {}
  cards.forEach((c) => {
    if (c.tags) {
      c.tags.forEach((t) => {
        map[t] = (map[t] || 0) + 1
      })
    }
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([tag, count]) => ({ tag, count }))
}

export function filterCards(cards, selectedTags, query) {
  let result = cards
  if (selectedTags.length > 0) {
    result = result.filter((c) =>
      selectedTags.every((t) => c.tags?.includes(t))
    )
  }
  if (query.trim()) {
    const q = query.toLowerCase()
    result = result.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.summary?.coreIdea?.toLowerCase().includes(q) ||
        c.summary?.keyPoints?.some((p) => p.toLowerCase().includes(q)) ||
        c.note?.toLowerCase().includes(q) ||
        c.tags?.some((t) => t.toLowerCase().includes(q))
    )
  }
  return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getRelatedCards(cards, currentId, count = 4) {
  const current = cards.find((c) => c.id === currentId)
  if (!current) return []
  const currentTags = new Set(current.tags || [])
  return cards
    .filter((c) => c.id !== currentId && c.status === 'done')
    .map((c) => ({
      ...c,
      score: (c.tags || []).filter((t) => currentTags.has(t)).length,
    }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

export function generateId() {
  return 'card-' + Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export function simulateAiProcess(card, updateCard, addToast) {
  setTimeout(() => {
    updateCard(card.id, {
      status: 'done',
      tags: ['AI生成', '待分类'],
      summary: {
        coreIdea: '这是 AI 自动提取的核心观点摘要（演示内容）。',
        keyPoints: [
          '关键信息点一：内容已成功采集并完成 AI 脱水处理',
          '关键信息点二：标签已自动生成，可在详情页手动调整',
          '关键信息点三：可在"我的备注"中添加个人解读',
        ],
        quote: '"这是从原文中提炼的最具价值的金句。"',
      },
    })
    addToast({ type: 'success', message: '✨ AI 已完成内容整理' })
  }, 3000)
}

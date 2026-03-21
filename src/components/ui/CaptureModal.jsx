import { useState } from 'react'
import useStore from '../../store/useStore'
import { generateId, simulateAiProcess } from '../../utils/helpers'

export function CaptureModal() {
  const { captureOpen, closeCapture, addCard, addToast, updateCard } = useStore()
  const [value, setValue] = useState('')
  const [mode, setMode] = useState('url') // 'url' | 'text'
  const [absorbing, setAbsorbing] = useState(false)

  if (!captureOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!value.trim()) return
    setAbsorbing(true)
    setTimeout(() => {
      const isUrl = value.startsWith('http://') || value.startsWith('https://')
      let platform = '手动输入'
      let icon = '✏️'
      if (isUrl) {
        if (value.includes('weixin') || value.includes('mp.weixin')) { platform = '微信公众号'; icon = '📱' }
        else if (value.includes('zhihu')) { platform = '知乎'; icon = '💡' }
        else if (value.includes('bilibili')) { platform = 'B站'; icon = '🎬' }
        else if (value.includes('xiaohongshu') || value.includes('xhslink')) { platform = '小红书'; icon = '📕' }
        else if (value.includes('sspai')) { platform = '少数派'; icon = '📖' }
        else { platform = '网页'; icon = '🌐' }
      }
      const newCard = {
        id: generateId(),
        title: isUrl ? `采集自 ${platform}` : value.slice(0, 40),
        sourceUrl: isUrl ? value : null,
        sourcePlatform: platform,
        sourceIcon: icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'processing',
        tags: [],
        summary: null,
        note: '',
        lastViewedAt: null,
      }
      addCard(newCard)
      addToast({ type: 'success', message: '🌀 正在 AI 整理中…' })
      simulateAiProcess(newCard, updateCard, addToast)
      setValue('')
      setAbsorbing(false)
      closeCapture()
    }, 400)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeCapture()}>
      <div
        className="glass-card w-full max-w-lg mx-4 p-6 animate-slide-in"
        style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-medium text-base" style={{ color: 'var(--text-primary)' }}>
            投入你的房间
          </h3>
          <button onClick={closeCapture} className="text-xl leading-none opacity-40 hover:opacity-70 transition-opacity" style={{ color: 'var(--text-primary)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
        </div>

        <div className="flex gap-2 mb-4">
          {['url', 'text'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="px-3 py-1.5 rounded-lg text-sm transition-all"
              style={{
                background: mode === m ? 'var(--accent)' : 'var(--bg-deep)',
                color: mode === m ? 'white' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {m === 'url' ? '🔗 链接' : '✏️ 文字'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'url' ? (
            <input
              autoFocus
              className="input-field mb-4"
              placeholder="粘贴任意网页链接…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <textarea
              autoFocus
              className="input-field mb-4 resize-none"
              rows={4}
              placeholder="粘贴文字片段、金句、随手想法…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              style={{ lineHeight: '1.6' }}
            />
          )}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={closeCapture}>取消</button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!value.trim() || absorbing}
              style={absorbing ? { animation: 'absorb 0.4s ease' } : {}}
            >
              {absorbing ? '采集中…' : '采集入库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

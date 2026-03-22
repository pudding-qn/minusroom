import { useState, useRef, useEffect, useCallback } from 'react'
import useStore from '../../store/useStore'
import { generateId, simulateAiProcess } from '../../utils/helpers'

/* ── Mode definitions ── */
const MODES = [
  { id: 'url',   label: '链接',  icon: '○' },
  { id: 'text',  label: '文字',  icon: '✦' },
  { id: 'voice', label: '语音',  icon: '◎' },
  { id: 'image', label: '图片',  icon: '◈' },
  { id: 'audio', label: '音视频',  icon: '▶' },
]

/* ── Platform detector ── */
function detectPlatform(url) {
  if (!url) return { platform: '手动输入', icon: '✦' }
  if (url.includes('weixin') || url.includes('mp.weixin')) return { platform: '微信公众号', icon: '✦' }
  if (url.includes('zhihu'))      return { platform: '知乎',  icon: '◈' }
  if (url.includes('bilibili'))   return { platform: 'B站',   icon: '▶' }
  if (url.includes('xiaohongshu') || url.includes('xhslink')) return { platform: '小红书', icon: '♦' }
  if (url.includes('sspai'))      return { platform: '少数派', icon: '◇' }
  return { platform: '网页', icon: '○' }
}

/* ── Voice recording hook ── */
function useVoiceInput(onFinal, onInterim) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(false)
  const recRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    setSupported(!!SpeechRecognition)
  }, [])

  const start = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const rec = new SpeechRecognition()
    rec.lang = 'zh-CN'
    rec.continuous = true
    rec.interimResults = true
    recRef.current = rec

    rec.onresult = (e) => {
      let finalChunk = ''
      let interimChunk = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalChunk += e.results[i][0].transcript
        } else {
          interimChunk += e.results[i][0].transcript
        }
      }
      // Commit finalized text into permanent value
      if (finalChunk) onFinal(prev => prev + finalChunk)
      // Pass interim text for live preview (overwrite, not accumulate)
      onInterim(interimChunk)
    }
    rec.onerror = () => { setListening(false); onInterim('') }
    rec.onend   = () => { setListening(false); onInterim('') }
    rec.start()
    setListening(true)
  }, [onFinal, onInterim])

  const stop = useCallback(() => {
    recRef.current?.stop()
    setListening(false)
    onInterim('')
  }, [])

  return { listening, supported, start, stop }
}

/* ── File preview label ── */
function FilePreview({ file, onRemove }) {
  if (!file) return null
  const isImage = file.type.startsWith('image/')
  const isVideo = file.type.startsWith('video/')
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-xl mb-4"
      style={{ background: 'var(--bg-2)', border: '1px solid var(--line)' }}
    >
      {isImage ? (
        <img
          src={URL.createObjectURL(file)}
          alt=""
          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          style={{ border: '1px solid var(--line)' }}
        />
      ) : (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
          style={{ background: 'var(--bg-3)', color: 'var(--accent)' }}
        >
          {isVideo ? '▣' : '♪'}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-1)' }}>{file.name}</p>
        <p className="text-[10px] tracking-wide mt-0.5" style={{ color: 'var(--text-3)' }}>
          {isImage ? 'AI 将识别图片内容并提取标题' : 'AI 将提取音轨并转写为文字后脱水整理'}
          {' · '}
          {(file.size / 1024).toFixed(0)} KB
        </p>
      </div>
      <button
        onClick={onRemove}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', fontSize: 16, lineHeight: 1, flexShrink: 0 }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
      >×</button>
    </div>
  )
}

/* ── Main Modal ── */
export function CaptureModal() {
  const { captureOpen, closeCapture, addCard, addToast, updateCard } = useStore()
  const [mode, setMode] = useState('url')
  const [value, setValue] = useState('')
  const [interim, setInterim] = useState('')
  const [file, setFile] = useState(null)
  const [entering, setEntering] = useState(false)
  const inputRef = useRef(null)
  const fileRef = useRef(null)

  const { listening, supported: voiceSupported, start: startVoice, stop: stopVoice } =
    useVoiceInput(setValue, setInterim)

  // Reset on open/close
  useEffect(() => {
    if (!captureOpen) {
      setTimeout(() => { setValue(''); setFile(null); setMode('url'); setEntering(false) }, 300)
    } else {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [captureOpen])

  // Stop voice when switching mode
  const switchMode = (m) => {
    if (listening) stopVoice()
    setMode(m)
    setFile(null)
    setTimeout(() => inputRef.current?.focus(), 80)
  }

  const canSubmit = () => {
    if (mode === 'image' || mode === 'audio') return !!file
    return value.trim().length > 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit() || entering) return
    if (listening) stopVoice()
    setEntering(true)

    setTimeout(() => {
      let platform = '手动输入', icon = '✦', title = ''

      if (mode === 'url') {
        const { platform: p, icon: ic } = detectPlatform(value)
        platform = p; icon = ic
        title = `采集自 ${platform}`
      } else if (mode === 'text') {
        title = value.slice(0, 50)
      } else if (mode === 'voice') {
        platform = '语音输入'; icon = '◎'
        title = value.slice(0, 50) || '语音笔记'
      } else if (mode === 'image') {
        platform = '图片识别'; icon = '◈'
        title = file?.name?.replace(/\.[^.]+$/, '') || '图片内容'
      } else if (mode === 'audio') {
        platform = '音视频转写'; icon = '▶'
        title = file?.name?.replace(/\.[^.]+$/, '') || '音视频内容'
      }

      const newCard = {
        id: generateId(),
        title,
        sourceUrl: mode === 'url' ? value : null,
        sourcePlatform: platform,
        sourceIcon: icon,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'processing',
        mediaType: mode === 'image' ? 'image' : mode === 'audio' ? 'audio' : null,
        tags: [], summary: null, note: '',
        lastViewedAt: null,
      }

      addCard(newCard)

      const processMsgs = {
        url:   '正在解析链接…',
        text:  '正在蒸馏内容…',
        voice: 'AI 正在整理语音笔记…',
        image: 'AI 正在识别图片内容…',
        audio: 'AI 正在转写音视频…',
      }
      addToast({ message: processMsgs[mode] })
      simulateAiProcess(newCard, updateCard, addToast)

      setValue(''); setFile(null); setEntering(false)
      closeCapture()
    }, 380)
  }

  if (!captureOpen) return null

  return (
    <div
      className="m-overlay"
      style={{ alignItems: 'flex-end', paddingBottom: '5.5rem' }}
      onClick={(e) => e.target === e.currentTarget && closeCapture()}
    >
      <div
        className="anim-drift w-full mx-5 max-w-xl"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-xl)',
          padding: '26px 26px 22px',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3
              className="font-display text-lg"
              style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic', letterSpacing: '-0.01em' }}
            >
              投入房间
            </h3>
            <p className="text-[11px] mt-0.5 tracking-wide" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
              链接、文字、语音、图片、音视频，AI 静默整理
            </p>
          </div>
          <button
            onClick={closeCapture}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-3)', fontSize: 18, lineHeight: 1,
              transition: 'color 0.2s', marginTop: 2,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-1)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-3)'}
          >×</button>
        </div>

        {/* ── Mode tabs ── */}
        <div
          className="flex mb-5 p-1 rounded-xl gap-0.5"
          style={{ background: 'var(--bg-2)', width: '100%' }}
        >
          {MODES.map(({ id, label, icon }) => (
            <button
              key={id}
              onClick={() => switchMode(id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] tracking-wide transition-all duration-250"
              style={{
                background: mode === id ? 'var(--bg)' : 'transparent',
                color: mode === id ? 'var(--text-1)' : 'var(--text-3)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontWeight: mode === id ? 500 : 400,
                boxShadow: mode === id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span style={{ fontSize: 10, opacity: 0.8 }}>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* ── Input area ── */}
        <form onSubmit={handleSubmit}>

          {/* URL */}
          {mode === 'url' && (
            <input
              ref={inputRef}
              autoFocus
              className="m-input mb-5"
              placeholder="粘贴任意网页链接…"
              value={value}
              onChange={e => setValue(e.target.value)}
              style={{ fontSize: 13 }}
            />
          )}

          {/* Text */}
          {mode === 'text' && (
            <textarea
              ref={inputRef}
              autoFocus
              className="m-input mb-5 resize-none"
              rows={5}
              placeholder="粘贴文字、金句、随手一想…"
              value={value}
              onChange={e => setValue(e.target.value)}
              style={{ fontSize: 13, lineHeight: 1.8 }}
            />
          )}

          {/* Voice */}
          {mode === 'voice' && (
            <div className="mb-5">
              {/* Transcript area */}
              <div
                className="m-input resize-none mb-3 relative"
                style={{ minHeight: 110, fontSize: 13, lineHeight: 1.8, padding: '12px 16px', cursor: 'text' }}
              >
                {/* Finalized text: always-editable textarea */}
                <textarea
                  ref={inputRef}
                  className="w-full bg-transparent outline-none resize-none"
                  style={{
                    minHeight: 60,
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: 'var(--text-1)',
                    fontFamily: 'inherit',
                    border: 'none',
                    display: 'block',
                  }}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  placeholder={listening ? '' : '点击「开始录音」后对着麦克风说话'}
                />

                {/* Live interim text — rendered below finalized, in accent color */}
                {interim && (
                  <span
                    style={{
                      display: 'block',
                      fontSize: 13,
                      lineHeight: 1.8,
                      color: 'var(--accent)',
                      opacity: 0.75,
                      fontStyle: 'italic',
                      marginTop: value ? 2 : 0,
                      pointerEvents: 'none',
                      letterSpacing: '0.01em',
                    }}
                  >
                    {interim}
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: '1em',
                        background: 'var(--accent)',
                        marginLeft: 3,
                        verticalAlign: 'text-bottom',
                        animation: 'blink 1s step-end infinite',
                      }}
                    />
                  </span>
                )}

                {/* Listening pill — top-right */}
                {listening && (
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <span className="processing-ring" style={{ width: 8, height: 8 }} />
                    <span style={{ fontSize: 10, color: 'var(--accent)', letterSpacing: '0.1em' }}>录音中</span>
                  </div>
                )}

                {/* Empty + not listening placeholder handled by textarea above */}
              </div>

              <div className="flex items-center gap-2">
                {!voiceSupported ? (
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    当前浏览器不支持语音识别，请使用 Chrome
                  </p>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={listening ? stopVoice : startVoice}
                      className="m-btn text-xs flex-1"
                      style={{
                        padding: '9px 16px',
                        background: listening ? 'rgba(160,96,96,0.08)' : 'var(--bg-2)',
                        color: listening ? '#A06060' : 'var(--text-2)',
                        border: `1px solid ${listening ? 'rgba(160,96,96,0.25)' : 'var(--line)'}`,
                        letterSpacing: '0.04em',
                      }}
                    >
                      {listening ? '■ 停止录音' : '◎ 开始录音'}
                    </button>
                    {value && (
                      <button
                        type="button"
                        onClick={() => setValue('')}
                        className="m-btn m-btn-ghost text-xs"
                        style={{ padding: '9px 14px', fontSize: 11 }}
                      >
                        清除
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Image upload */}
          {mode === 'image' && (
            <div className="mb-5">
              <FilePreview file={file} onRemove={() => setFile(null)} />
              {!file && (
                <div
                  className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300"
                  style={{
                    border: '1.5px dashed var(--line)',
                    background: 'var(--bg-2)',
                    padding: '32px 20px',
                    minHeight: 140,
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
                  onDrop={e => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = 'var(--line)'
                    const f = e.dataTransfer.files[0]
                    if (f?.type.startsWith('image/')) setFile(f)
                    else addToast({ message: '请上传图片文件（JPG / PNG / WebP）' })
                  }}
                >
                  <span style={{ fontSize: 28, color: 'var(--text-3)', lineHeight: 1 }}>◈</span>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-2)' }}>
                      点击选择或拖拽图片
                    </p>
                    <p className="text-[10px] tracking-wide" style={{ color: 'var(--text-3)' }}>
                      JPG · PNG · WebP · GIF
                    </p>
                  </div>
                  <p
                    className="text-[10px] tracking-wide text-center max-w-xs leading-relaxed"
                    style={{ color: 'var(--text-3)', fontStyle: 'italic' }}
                  >
                    AI 将识别图片内容，自动提取标题和关键词，便于后续搜索
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) setFile(f) }}
              />
            </div>
          )}

          {/* Audio/Video upload */}
          {mode === 'audio' && (
            <div className="mb-5">
              <FilePreview file={file} onRemove={() => setFile(null)} />
              {!file && (
                <div
                  className="rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300"
                  style={{
                    border: '1.5px dashed var(--line)',
                    background: 'var(--bg-2)',
                    padding: '32px 20px',
                    minHeight: 140,
                  }}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--accent)' }}
                  onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
                  onDrop={e => {
                    e.preventDefault()
                    e.currentTarget.style.borderColor = 'var(--line)'
                    const f = e.dataTransfer.files[0]
                    if (f && (f.type.startsWith('audio/') || f.type.startsWith('video/'))) setFile(f)
                    else addToast({ message: '请上传音频或视频文件（MP3 / WAV / M4A / MP4 / MOV / WEBM）' })
                  }}
                >
                  <span style={{ fontSize: 28, color: 'var(--text-3)', lineHeight: 1 }}>▶</span>
                  <div className="text-center">
                    <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--text-2)' }}>
                      点击选择或拖拽音视频
                    </p>
                    <p className="text-[10px] tracking-wide" style={{ color: 'var(--text-3)' }}>
                      MP3 · WAV · M4A · OGG · MP4 · MOV · WEBM
                    </p>
                  </div>
                  <p
                    className="text-[10px] tracking-wide text-center max-w-xs leading-relaxed"
                    style={{ color: 'var(--text-3)', fontStyle: 'italic' }}
                  >
                    AI 将提取音轨并转写为文字，再进行脱水整理，提取核心观点
                  </p>
                </div>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="audio/*,video/*"
                className="hidden"
                onChange={e => { const f = e.target.files[0]; if (f) setFile(f) }}
              />
            </div>
          )}

          {/* Footer actions */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              className="m-btn m-btn-ghost text-xs"
              onClick={closeCapture}
              style={{ padding: '8px 16px' }}
            >
              取消
            </button>
            <button
              type="submit"
              className="m-btn m-btn-primary text-xs"
              disabled={!canSubmit() || entering}
              style={{
                padding: '8px 22px',
                letterSpacing: '0.05em',
                opacity: (!canSubmit() || entering) ? 0.45 : 1,
                transition: 'all 0.35s ease',
              }}
            >
              {entering ? '溶解中…' : '采集入库'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

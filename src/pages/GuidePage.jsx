/* ── GuidePage: minusROOM 使用说明 ──
   Editorial-grade layout with strong typographic hierarchy,
   generous negative space, and staggered reveal animations.
   Morandi palette, Cormorant Garamond display + Geist body. ── */

import { useEffect, useRef, useState } from 'react'

/* ═══ Intersection Observer hook for scroll-triggered animations ═══ */
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, visible]
}

/* ═══ Section wrapper with reveal animation ═══ */
function Section({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal(0.08)
  return (
    <section
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s cubic-bezier(0.23,1,0.32,1) ${delay}s, transform 0.7s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      {children}
    </section>
  )
}

/* ═══ Decorative section divider ═══ */
function Divider({ label }) {
  return (
    <div className="flex items-center gap-4" style={{ margin: '64px 0 40px' }}>
      <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
      <div className="flex items-center gap-3">
        <div
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--accent)', opacity: 0.5,
          }}
        />
        <span
          style={{
            fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--text-3)', fontWeight: 400, whiteSpace: 'nowrap',
          }}
        >
          {label}
        </span>
        <div
          style={{
            width: 5, height: 5, borderRadius: '50%',
            background: 'var(--accent)', opacity: 0.5,
          }}
        />
      </div>
      <div className="flex-1 h-px" style={{ background: 'var(--line)' }} />
    </div>
  )
}

/* ═══ Section heading ═══ */
function SectionHeading({ title, subtitle, align = 'left' }) {
  return (
    <div style={{ textAlign: align, marginBottom: 32 }}>
      <h2
        className="font-display"
        style={{
          fontSize: 28, fontWeight: 300, fontStyle: 'italic',
          letterSpacing: '-0.025em', color: 'var(--text-1)',
          lineHeight: 1.2, marginBottom: subtitle ? 10 : 0,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, fontWeight: 300 }}>
          {subtitle}
        </p>
      )}
    </div>
  )
}

/* ═══ Persona card ═══ */
function PersonaCard({ index, type, tag, desc, delay }) {
  const [ref, visible] = useReveal(0.1)
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
        padding: '28px 0',
        borderBottom: '1px solid var(--line)',
      }}
      className="flex items-start gap-6"
    >
      {/* Large index number */}
      <div
        className="font-display flex-shrink-0"
        style={{
          fontSize: 42, fontWeight: 300, fontStyle: 'italic',
          color: 'var(--accent)', lineHeight: 1, width: 48,
          letterSpacing: '-0.04em', userSelect: 'none', opacity: 0.6,
        }}
      >
        {index}
      </div>
      <div className="flex-1 min-w-0" style={{ paddingTop: 4 }}>
        <div className="flex items-baseline gap-3 mb-3 flex-wrap">
          <span
            className="font-display"
            style={{
              fontSize: 18, fontWeight: 400, fontStyle: 'italic',
              color: 'var(--text-1)', letterSpacing: '-0.015em',
            }}
          >
            {type}
          </span>
          <span
            style={{
              fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--text-3)', fontWeight: 400,
              padding: '3px 8px', borderRadius: 4,
              background: 'rgba(139,126,116,0.06)', border: '1px solid var(--line)',
            }}
          >
            {tag}
          </span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.9, fontWeight: 300 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

/* ═══ Feature card — 2-column grid item ═══ */
function FeatureCard({ icon, title, desc, delay }) {
  const [ref, visible] = useReveal(0.1)
  const [hovered, setHovered] = useState(false)
  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? (hovered ? 'translateY(-3px)' : 'translateY(0)')
          : 'translateY(20px)',
        transition: `all 0.5s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
        padding: '24px 22px',
        borderRadius: 16,
        background: hovered ? 'var(--bg-2)' : 'transparent',
        border: `1px solid ${hovered ? 'rgba(139,126,116,0.15)' : 'var(--line)'}`,
        cursor: 'default',
      }}
    >
      <div
        className="flex items-center justify-center"
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'rgba(139,126,116,0.07)',
          border: '1px solid var(--line)',
          color: 'var(--accent)', marginBottom: 16,
          transition: 'background 0.3s ease',
          ...(hovered ? { background: 'rgba(139,126,116,0.12)' } : {}),
        }}
      >
        {icon}
      </div>
      <p style={{
        fontSize: 13, fontWeight: 500, color: 'var(--text-1)',
        marginBottom: 8, letterSpacing: '-0.01em',
      }}>
        {title}
      </p>
      <p style={{ fontSize: 12, color: 'var(--text-2)', lineHeight: 1.85, fontWeight: 300 }}>
        {desc}
      </p>
    </div>
  )
}

/* ═══ Step — refined timeline ═══ */
function StepItem({ n, total, title, desc, delay }) {
  const [ref, visible] = useReveal(0.1)
  const isLast = n === total
  return (
    <div
      ref={ref}
      className="flex gap-6"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(-16px)',
        transition: `all 0.6s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      {/* Timeline */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
        <div
          className="flex items-center justify-center flex-shrink-0"
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--accent)', color: 'var(--text-inv)',
            fontSize: 12, fontWeight: 500, letterSpacing: 0,
          }}
        >
          {n}
        </div>
        {!isLast && (
          <div
            className="flex-1 mt-1.5"
            style={{
              width: 1, minHeight: 48,
              background: 'linear-gradient(to bottom, var(--accent), transparent)',
              opacity: 0.3,
            }}
          />
        )}
      </div>
      {/* Content */}
      <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-10'}`} style={{ paddingTop: 4 }}>
        <p style={{
          fontSize: 15, fontWeight: 500, color: 'var(--text-1)',
          marginBottom: 8, letterSpacing: '-0.01em', lineHeight: 1.3,
        }}>
          {title}
        </p>
        <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.9, fontWeight: 300 }}>
          {desc}
        </p>
      </div>
    </div>
  )
}

/* ═══ Capture mode row ═══ */
function CaptureRow({ icon, mode, desc, last, delay }) {
  const [ref, visible] = useReveal(0.1)
  return (
    <div
      ref={ref}
      className="grid gap-5 py-6 px-6"
      style={{
        gridTemplateColumns: '88px 1fr',
        borderBottom: last ? 'none' : '1px solid var(--line)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: `all 0.5s cubic-bezier(0.23,1,0.32,1) ${delay}s`,
      }}
    >
      <div className="flex items-center gap-3 pt-0.5">
        <span style={{ color: 'var(--accent)', display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
        <span style={{
          fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--text-3)', lineHeight: 1.6, fontWeight: 400,
        }}>
          {mode}
        </span>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 2, fontWeight: 300 }}>
        {desc}
      </p>
    </div>
  )
}


/* ═══ SVG Icons ═══ */
const s = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const featureIcons = {
  capture:    <svg {...s}><path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="5"/></svg>,
  ai:         <svg {...s}><path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26z"/></svg>,
  tag:        <svg {...s}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  agent:      <svg {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><path d="M11 8v6M8 11h6"/></svg>,
  digest:     <svg {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  relate:     <svg {...s}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  breadcrumb: <svg {...s}><polyline points="9 18 15 12 9 6"/><line x1="3" y1="12" x2="9" y2="12"/></svg>,
}

const sc = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }

const captureIcons = {
  link:  <svg {...sc}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  text:  <svg {...sc}><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>,
  voice: <svg {...sc}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>,
  image: <svg {...sc}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  av:    <svg {...sc}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>,
}


/* ════════════════════════════════════════════════════════ */
export function GuidePage() {
  const personas = [
    { index: '01', type: '多线程知识工作者', tag: 'Knowledge Worker', desc: '每天穿梭于公众号、知乎、B站、小红书，信息爆炸却难以沉淀。minusROOM 把碎片链接一键蒸馏成摘要，告别「收藏即吃灰」。' },
    { index: '02', type: '数字极简主义者', tag: 'Digital Minimalist', desc: '讨厌复杂工具和繁重的整理仪式。minusROOM 自动完成分类、打标、摘要，你只需要「扔进来」——其余的交给 AI。' },
    { index: '03', type: '灵感猎人 / 内容创作者', tag: 'Creative & Creator', desc: '频繁捕捉碎片灵感，希望它们在未来创作时「随机撞见」你。每日回顾在意想不到的时刻，把沉睡的想法重新点燃。' },
  ]

  const features = [
    { icon: featureIcons.capture, title: '多模态采集', desc: '支持链接、文字、实时语音识别、图片上传、音视频上传五种模式。点击顶栏右侧「+」按钮即可开始采集。' },
    { icon: featureIcons.ai,      title: 'AI 自动脱水', desc: '采集即处理，AI 提炼「核心观点 + 关键信息点 + 原文金句」三段式摘要，风格一致，体验统一。' },
    { icon: featureIcons.tag,     title: '语义标签体系', desc: 'AI 自动生成 3~5 个语义标签，支持手动增删与重命名。标签库页提供全局标签维度的资产浏览。' },
    { icon: featureIcons.agent,   title: '知识库问答 Agent', desc: '按 ⌘K 唤起智能问答抽屉。支持「本地知识库」和「联网辅助」两种模式，自动匹配卡片并生成回答。' },
    { icon: featureIcons.digest,  title: 'Daily Digest', desc: '每天首屏展示 3 张算法精选历史卡片，优先唤醒长期未访问的内容。支持 Web Push 定时推送。' },
    { icon: featureIcons.relate,  title: 'AI 关联发现', desc: '卡片详情页底部，AI 基于语义相似度推荐相关卡片，让跨域信息产生化学反应。' },
      ]

  const steps = [
    { title: '采集 — 扔进来', desc: '点击顶栏右侧「+」按钮，选择链接、文字、语音、图片或音视频。采集动作设计在 5 秒内完成，不中断你当前的浏览状态。' },
    { title: '脱水 — AI 静默整理', desc: '提交后无需任何操作。AI 自动抓取正文、生成三段式摘要、打上语义标签。处理期间卡片显示「整理中」，完成后自动刷新。' },
    { title: '唤醒 — 让资产流动', desc: '每日打开应用，Digest 区展示今日回顾。浏览任意卡片时，底部 AI 推荐语义相近的历史内容。按 ⌘K 向知识库 Agent 提问，让沉睡的资产变成可对话的知识伙伴。' },
  ]

  const captureModes = [
    { icon: captureIcons.link,  mode: '链接', desc: '粘贴任意 URL，自动抓取正文并识别来源平台（微信公众号、知乎、B站、小红书等），无需手动复制内容。' },
    { icon: captureIcons.text,  mode: '文字', desc: '粘贴段落、金句或随手想法。适合无法通过链接采集的内容，或记录一闪而过的灵感碎片。' },
    { icon: captureIcons.voice, mode: '语音', desc: '实时中文语音识别，对着麦克风说话，文字实时呈现，可在提交前手动修改。需 Chrome 浏览器并授权麦克风权限。' },
    { icon: captureIcons.image, mode: '图片', desc: 'AI 识别图片内容，提取标题与关键信息便于搜索。支持 JPG、PNG、WebP、GIF，支持拖拽上传。' },
    { icon: captureIcons.av,    mode: '音视频', desc: 'AI 提取音轨并转写为文字后脱水整理，生成摘要卡片。支持 MP3、WAV、M4A、OGG、MP4、MOV、WEBM。' },
  ]

  return (
    <div
      className="max-w-2xl mx-auto pb-20 pt-12"
      style={{ overflowX: 'hidden', paddingLeft: 32, paddingRight: 32 }}
    >

      {/* ═══ HERO ═══ */}
      <Section className="mb-16">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-8">
          <div style={{ width: 24, height: 1, background: 'var(--accent)', opacity: 0.5 }} />
          <span style={{
            fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
            color: 'var(--accent)', fontWeight: 400,
          }}>
            使用说明
          </span>
        </div>

        {/* Headline */}
        <h1
          className="font-display"
          style={{
            fontSize: 'clamp(40px, 7vw, 58px)',
            fontWeight: 300, fontStyle: 'italic',
            letterSpacing: '-0.035em', color: 'var(--text-1)',
            lineHeight: 1.05, marginBottom: 28,
          }}
        >
          Less Noise,
          <br />
          <span style={{ color: 'var(--accent)' }}>More Room.</span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 14.5, color: 'var(--text-2)', lineHeight: 2,
          maxWidth: 520, fontWeight: 300,
        }}>
          minusROOM 负责过滤噪音，将万卷长文浓缩为方寸卡片。
          <br />它会在你遗忘时主动扣门，在你困惑时对答如流。
          <br />在这里，信息不再是负担，而是随取随用的智库资产。
        </p>

        {/* Pull quote */}
        <div
          className="mt-10"
          style={{
            paddingLeft: 20,
            borderLeft: '2px solid var(--accent)',
          }}
        >
          <p
            className="font-display"
            style={{
              fontSize: 16, fontStyle: 'italic', fontWeight: 400,
              color: 'var(--text-3)', lineHeight: 1.8,
              letterSpacing: '-0.01em',
            }}
          >
            减掉噪音，减掉排版负担，减掉记忆焦虑，
            <br />在信息的洪流里，为你减出一个思考的房间。
          </p>
        </div>
      </Section>

      {/* ═══ PERSONAS ═══ */}
      <Divider label="面向谁" />
      <Section>
        <SectionHeading title="面向谁" subtitle="如果你有以下任何一种身份认同，minusROOM 就是为你设计的。" />
        <div>
          {personas.map((p, i) => (
            <PersonaCard key={p.index} {...p} delay={i * 0.08} />
          ))}
        </div>
      </Section>

      {/* ═══ FEATURES — 2-column grid ═══ */}
      <Divider label="核心功能" />
      <Section>
        <SectionHeading title="核心功能" subtitle="从采集到回顾，AI 驱动每一步。" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 12,
          }}
        >
          {features.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 0.06} />
          ))}
        </div>
      </Section>

      {/* ═══ STEPS ═══ */}
      <Divider label="三步开始" />
      <Section>
        <SectionHeading title="三步开始" />
        <div style={{ paddingLeft: 4 }}>
          {steps.map((s, i) => (
            <StepItem key={s.title} n={i + 1} total={steps.length} {...s} delay={i * 0.1} />
          ))}
        </div>
      </Section>

      {/* ═══ CAPTURE MODES ═══ */}
      <Divider label="采集方式" />
      <Section>
        <SectionHeading title="采集方式" subtitle="五种模态，覆盖你遇到信息的所有场景。" />
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--line)', background: 'var(--surface)' }}
        >
          {captureModes.map((c, i) => (
            <CaptureRow
              key={c.mode} {...c}
              last={i === captureModes.length - 1}
              delay={i * 0.06}
            />
          ))}
        </div>
      </Section>

      {/* ═══ PHILOSOPHY ═══ */}
      <Divider label="产品哲学" />
      <Section className="mb-16">
        <SectionHeading title="产品哲学" />
        <div className="space-y-6">
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 2, fontWeight: 300 }}>
            minusROOM 不鼓励你「整理」。整理是人为干预，是负担。
            它鼓励你「采集」——就像随手拍照一样，零思考成本地把内容扔进来，
            剩下的事情让 AI 做。
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 2, fontWeight: 300 }}>
            真正的知识管理不是把东西存起来，而是让东西在正确的时候出现在你面前。
            Daily Digest 在每天清晨唤醒沉睡卡片，AI 关联发现在浏览时触发跨域灵感。
            而知识库问答 Agent 更进一步——你不需要翻找，只需要提问。
            Agent 会基于你的全部个人资产给出汇总回答，让你的知识库从「被动仓库」变成「主动的对话伙伴」。
          </p>
          <p style={{ fontSize: 13.5, color: 'var(--text-2)', lineHeight: 2, fontWeight: 300 }}>
            本地模式下，一切数据都在你的浏览器内流转，不上传、不泄露。
            联网辅助模式则在本地知识基础上补充公开信息，两种模式一键切换，
            你始终掌握信息的边界。
          </p>
        </div>
      </Section>

      {/* ═══ CTA FOOTER ═══ */}
      <Section>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid var(--line)' }}
        >
          {/* Accent strip */}
          <div style={{ background: 'var(--accent)', padding: '1.5px 0' }} />
          {/* Body */}
          <div
            className="px-7 py-7 flex items-center justify-between gap-6 flex-wrap"
            style={{ background: 'var(--bg-2)' }}
          >
            <div>
              <p
                className="font-display"
                style={{
                  fontSize: 20, fontWeight: 400, fontStyle: 'italic',
                  color: 'var(--text-1)', letterSpacing: '-0.015em',
                  marginBottom: 6,
                }}
              >
                开始采集你的第一条内容
              </p>
              <p style={{
                fontSize: 10, color: 'var(--text-3)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                少即是多 · 减即是得
              </p>
            </div>
            {/* Action hints */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Capture pill */}
              <div
                className="flex items-center gap-2.5"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 999, padding: '8px 14px 8px 8px',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: 17, fontWeight: 300, lineHeight: 1,
                }}>
                  +
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.04em' }}>
                  顶栏采集
                </span>
              </div>
              {/* Agent pill */}
              <div
                className="flex items-center gap-2.5"
                style={{
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  borderRadius: 999, padding: '8px 14px 8px 8px',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--accent)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: 'white',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>
                  </svg>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-2)', letterSpacing: '0.04em' }}>
                  ⌘K 问答
                </span>
              </div>
            </div>
          </div>
        </div>
      </Section>

    </div>
  )
}

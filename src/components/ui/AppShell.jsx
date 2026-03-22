import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import useStore from '../../store/useStore'
import { CaptureModal } from './CaptureModal'
import { SearchOverlay } from './SearchOverlay'
import { KnowledgeDrawer } from './KnowledgeDrawer'
import { Toast } from './Toast'

export function AppShell({ children }) {
  const { user, theme, toggleTheme, openCapture, openDrawer } = useStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Determine if current route is a card detail page coming from tags
  const isFromTags = location.pathname.startsWith('/space/card/') && location.search.includes('from=tags')

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openDrawer()
    }
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      onKeyDown={handleKey}
      tabIndex={-1}
      style={{ outline: 'none', background: 'var(--bg)' }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col w-52 flex-shrink-0 h-full relative"
        style={{
          background: 'var(--bg)',
          borderRight: '1px solid var(--line)',
        }}
      >
        {/* Wordmark */}
        <div className="px-6 pt-8 pb-6">
          <div className="flex items-baseline gap-1.5">
            <span
              className="font-display text-xl leading-none"
              style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}
            >
              minus
            </span>
            <span
              className="font-display text-xl leading-none"
              style={{ color: 'var(--accent)', fontWeight: 400 }}
            >
              ROOM
            </span>
          </div>
          <p
            className="mt-1 text-[10px] tracking-[0.15em] uppercase"
            style={{ color: 'var(--text-3)', fontWeight: 400 }}
          >
            Less Noise, More Room
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3">
          {[
            { to: '/space',    label: '我的空间', icon: <IconGrid /> },
            { to: '/tags',     label: '标签库',   icon: <IconTag /> },
            { to: '/guide',    label: '使用说明', icon: <IconGuide /> },
            { to: '/settings', label: '设置',     icon: <IconSliders /> },
          ].map(({ to, label, icon }) => {
            // Force "标签库" active when viewing a card from tags
            const forceActive = to === '/tags' && isFromTags
            // Force "我的空间" inactive when viewing a card from tags
            const forceInactive = to === '/space' && isFromTags
            return (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => {
                  const active = (isActive && !forceInactive) || forceActive
                  return `flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-all duration-300 ${
                    active ? 'font-normal' : 'font-light'
                  }`
                }}
                style={({ isActive }) => {
                  const active = (isActive && !forceInactive) || forceActive
                  return {
                    color: active ? 'var(--text-1)' : 'var(--text-3)',
                    background: active ? 'var(--bg-2)' : 'transparent',
                    letterSpacing: '0.01em',
                  }
                }}
              >
                <span style={{ opacity: 0.7 }}>{icon}</span>
                {label}
              </NavLink>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-6 space-y-0.5">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light w-full transition-all duration-300"
            style={{
              color: 'var(--text-3)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              letterSpacing: '0.01em',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text-2)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-3)' }}
          >
            <span style={{ fontSize: 13, opacity: 0.7 }}>{theme === 'light' ? '◐' : '○'}</span>
            {theme === 'light' ? '夜间模式' : '日间模式'}
          </button>

          {user && (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all duration-300"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-2)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
            >
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0"
                style={{ background: 'var(--accent)', color: 'var(--text-inv)' }}
              >
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span
                className="text-sm font-normal truncate"
                style={{ color: 'var(--text-2)', letterSpacing: '0.01em' }}
              >
                {user.name || user.email}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center gap-3 px-7 py-4 flex-shrink-0"
          style={{
            borderBottom: '1px solid var(--line)',
            background: 'var(--bg)',
          }}
        >
          {/* Capture input — the primary action */}
          <button
            onClick={openCapture}
            className="flex-1 flex items-center gap-3 text-left px-4 py-2.5 rounded-lg text-sm font-light transition-all duration-300"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              color: 'var(--text-3)',
              cursor: 'pointer',
              fontFamily: 'Geist, sans-serif',
              letterSpacing: '0.01em',
              maxWidth: 520,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,126,116,0.30)'; e.currentTarget.style.color = 'var(--text-2)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)'; e.currentTarget.style.color = 'var(--text-3)' }}
          >
            <span style={{ fontSize: 15, fontWeight: 400, color: 'var(--accent)', opacity: 0.8 }}>+</span>
            粘贴链接或输入文字，投入你的房间…
          </button>

          <button
            onClick={openCapture}
            className="p-2.5 rounded-lg transition-all duration-300"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--line)',
              cursor: 'pointer',
              color: 'var(--text-2)',
            }}
            title="采集内容"
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,126,116,0.30)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line)' }}
          >
            <IconPlus />
          </button>
        </header>

        <main id="main-scroll" className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Portal — floating search / knowledge agent */}
      <button
        className="portal fixed bottom-7 right-7 z-50"
        onClick={openDrawer}
        title="搜索 ⌘K"
        aria-label="知识库问答"
      >
        <IconSearch />
      </button>

      <CaptureModal />
      <SearchOverlay />
      <KnowledgeDrawer />
      <Toast />
    </div>
  )
}

/* ── Icons (minimal line-art) ── */
const s = { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.6 }
function IconGrid()    { return <svg {...s}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg> }
function IconTag()     { return <svg {...s}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg> }
function IconSliders() { return <svg {...s}><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/><circle cx="9" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="15" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="9" cy="18" r="2" fill="currentColor" stroke="none"/></svg> }
function IconGuide()   { return <svg {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg> }
function IconSearch()  { return <svg {...s}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg> }
function IconPlus()    { return <svg {...s}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> }

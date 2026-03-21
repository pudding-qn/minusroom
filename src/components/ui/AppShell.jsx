import { NavLink, useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'
import { CaptureModal } from './CaptureModal'
import { SearchOverlay } from './SearchOverlay'
import { Toast } from './Toast'

const navItems = [
  { to: '/space', icon: <IconSpace />, label: '我的空间' },
  { to: '/tags', icon: <IconTags />, label: '标签库' },
  { to: '/settings', icon: <IconSettings />, label: '设置' },
]

export function AppShell({ children }) {
  const { user, theme, toggleTheme, openCapture, openSearch } = useStore()
  const navigate = useNavigate()

  const handleKey = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
  }

  return (
    <div className="flex h-screen overflow-hidden" onKeyDown={handleKey} tabIndex={-1} style={{ outline: 'none', background: 'var(--bg)' }}>
      {/* Sidebar */}
      <aside className="nav-glass flex flex-col w-56 flex-shrink-0 h-full z-10" style={{ position: 'relative' }}>
        {/* Logo */}
        <div className="px-5 py-5 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-medium" style={{ background: 'var(--accent)', color: 'white' }}>−</div>
          <span className="font-medium text-sm tracking-tight" style={{ color: 'var(--text-primary)' }}>minusROOM</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 flex flex-col gap-0.5">
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'font-medium' : 'font-light'}`
              }
              style={({ isActive }) => ({
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                background: isActive ? 'var(--accent-pale)' : 'transparent',
              })}
            >
              {icon}
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 flex flex-col gap-1">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-light w-full transition-all"
            style={{ color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-deep)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <span className="text-base">{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>{theme === 'light' ? '夜间模式' : '日间模式'}</span>
          </button>
          {user && (
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all"
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-deep)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0" style={{ background: 'var(--accent)', color: 'white' }}>
                {(user.name || user.email || 'U')[0].toUpperCase()}
              </div>
              <span className="text-sm font-light truncate" style={{ color: 'var(--text-secondary)' }}>
                {user.name || user.email}
              </span>
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-6 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--nav-bg)', backdropFilter: 'blur(24px)' }}>
          <button
            onClick={openCapture}
            className="flex-1 flex items-center gap-3 text-left px-4 py-2.5 rounded-xl transition-all text-sm"
            style={{
              background: 'var(--bg-deep)',
              border: '1px solid var(--border)',
              color: 'var(--text-ghost)',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontWeight: 300,
              maxWidth: 480,
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <span className="text-base">+</span>
            <span>粘贴链接或文字，采集入库…</span>
          </button>
          <button
            onClick={openSearch}
            className="p-2.5 rounded-xl transition-all"
            style={{ background: 'var(--bg-deep)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-secondary)' }}
            title="搜索 (⌘K)"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Portal (floating capture button) */}
      <button
        onClick={openCapture}
        className="portal-btn fixed bottom-6 right-6 z-50"
        title="采集内容"
        aria-label="采集内容"
      >
        +
      </button>

      <CaptureModal />
      <SearchOverlay />
      <Toast />
    </div>
  )
}

function IconSpace() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg>
}
function IconTags() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
}
function IconSettings() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
}

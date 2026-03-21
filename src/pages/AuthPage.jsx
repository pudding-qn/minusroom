import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export function AuthPage() {
  const { setUser } = useStore()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleEmail = (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 1000)
  }

  const handleGoogle = () => {
    setUser({ email: 'demo@minusroom.app', name: 'Demo User', provider: 'google' })
    navigate('/space')
  }

  // Demo shortcut: click the sent message to auto login
  const handleMagicDemo = () => {
    setUser({ email, name: email.split('@')[0], provider: 'magic' })
    navigate('/space')
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #8FA38E 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #6A7B8F 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-sm animate-fade-up">
        {/* Brand */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4" style={{ background: 'var(--accent)', boxShadow: '0 8px 32px rgba(107,127,106,0.35)' }}>
            <span className="text-2xl font-light text-white">−</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>minusROOM</h1>
          <p className="text-sm font-light tracking-wide" style={{ color: 'var(--text-ghost)' }}>Less Noise, More Room.</p>
        </div>

        <div className="glass-card p-6" style={{ boxShadow: '0 20px 60px rgba(44,44,42,0.1)' }}>
          {!sent ? (
            <>
              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 py-3 rounded-xl text-sm font-medium transition-all mb-4"
                style={{
                  background: 'var(--bg-deep)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                使用 Google 账号登录
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
                <span className="text-xs" style={{ color: 'var(--text-ghost)' }}>或</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              </div>

              {/* Email */}
              <form onSubmit={handleEmail}>
                <input
                  type="email"
                  className="input-field mb-3"
                  placeholder="输入你的邮箱地址"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary w-full" disabled={loading}>
                  {loading ? '发送中…' : '发送登录链接'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-fade-up">
              <div className="text-3xl mb-3">📬</div>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>邮件已发送至</p>
              <p className="text-sm mb-4" style={{ color: 'var(--accent)' }}>{email}</p>
              <p className="text-xs mb-5" style={{ color: 'var(--text-ghost)' }}>前往邮箱点击登录链接，无需密码即可进入</p>
              <button
                onClick={handleMagicDemo}
                className="btn-primary w-full mb-2"
              >
                ✨ 演示：直接进入（Demo）
              </button>
              <div className="flex gap-2 justify-center">
                <button onClick={() => { setSent(false); setEmail('') }} className="text-xs" style={{ color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}>更换邮箱</button>
                <span className="text-xs" style={{ color: 'var(--border)' }}>·</span>
                <button onClick={handleEmail} className="text-xs" style={{ color: 'var(--text-ghost)', background: 'none', border: 'none', cursor: 'pointer' }}>重新发送</button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'var(--text-ghost)' }}>
          继续即表示你同意我们的{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>服务条款</span>
          {' '}与{' '}
          <span style={{ color: 'var(--accent)', cursor: 'pointer' }}>隐私政策</span>
        </p>
      </div>
    </div>
  )
}

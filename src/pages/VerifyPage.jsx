import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export function VerifyPage() {
  const { setUser } = useStore()
  const navigate = useNavigate()

  useEffect(() => {
    const t = setTimeout(() => {
      setUser({ email: 'demo@minusroom.app', name: 'Demo User', provider: 'magic' })
      navigate('/space')
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center animate-fade-up">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-t-transparent animate-spin-slow" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        <p className="text-sm font-light" style={{ color: 'var(--text-secondary)' }}>正在验证身份…</p>
      </div>
    </div>
  )
}

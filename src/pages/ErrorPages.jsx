import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 animate-fade-up" style={{ background: 'var(--bg)' }}>
      <div className="text-6xl mb-5 animate-float">🌑</div>
      <h1 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>这个房间不存在</h1>
      <p className="text-sm font-light mb-6" style={{ color: 'var(--text-ghost)' }}>你访问的页面已经消失在噪音里了</p>
      <button className="btn-primary" onClick={() => navigate('/space')}>返回我的空间</button>
    </div>
  )
}

export function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 animate-fade-up" style={{ background: 'var(--bg)' }}>
      <div className="text-6xl mb-5">⚡</div>
      <h1 className="text-xl font-medium mb-2" style={{ color: 'var(--text-primary)' }}>服务暂时出了点问题</h1>
      <p className="text-sm font-light mb-6" style={{ color: 'var(--text-ghost)' }}>别担心，你的数据都还在</p>
      <div className="flex gap-3">
        <button className="btn-primary" onClick={() => window.location.reload()}>刷新页面</button>
        <button className="btn-ghost" onClick={() => window.location.href = '/space'}>返回主页</button>
      </div>
      <p className="text-xs mt-8" style={{ color: 'var(--text-ghost)' }}>
        如果问题持续，请联系 <span style={{ color: 'var(--accent)' }}>hi@minusroom.app</span>
      </p>
    </div>
  )
}

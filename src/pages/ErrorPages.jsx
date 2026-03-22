import { useNavigate } from 'react-router-dom'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 anim-fade" style={{ background: 'var(--bg)' }}>
      <p className="font-display text-6xl mb-4" style={{ color: 'var(--text-3)', fontWeight: 400, fontStyle: 'italic' }}>
        404
      </p>
      <p className="text-sm font-normal mb-1.5" style={{ color: 'var(--text-2)', fontWeight: 400 }}>
        这个房间不存在
      </p>
      <p className="text-xs mb-8 tracking-wide" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
        你访问的页面已消散在噪音里
      </p>
      <button className="m-btn m-btn-primary text-xs" onClick={() => navigate('/space')} style={{ letterSpacing: '0.06em' }}>
        返回我的空间
      </button>
    </div>
  )
}

export function ErrorPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 anim-fade" style={{ background: 'var(--bg)' }}>
      <p className="font-display text-5xl mb-4" style={{ color: 'var(--text-3)', fontWeight: 400, fontStyle: 'italic' }}>⌁</p>
      <p className="text-sm font-normal mb-1.5" style={{ color: 'var(--text-2)', fontWeight: 400 }}>服务暂时出了问题</p>
      <p className="text-xs mb-8 tracking-wide" style={{ color: 'var(--text-3)', fontWeight: 400 }}>你的数据都还安全地在房间里</p>
      <div className="flex gap-3">
        <button className="m-btn m-btn-primary text-xs" onClick={() => window.location.reload()} style={{ letterSpacing: '0.06em' }}>刷新页面</button>
        <button className="m-btn m-btn-ghost text-xs" onClick={() => window.location.href = '/space'} style={{ letterSpacing: '0.04em' }}>返回主页</button>
      </div>
      <p className="text-[10px] mt-8 font-light" style={{ color: 'var(--text-3)' }}>
        如问题持续，联系 <span style={{ color: 'var(--accent)' }}>hi@minusroom.app</span>
      </p>
    </div>
  )
}

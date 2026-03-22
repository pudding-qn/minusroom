import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const Label = ({ children }) => (
  <p className="text-[9px] tracking-[0.18em] uppercase mb-3" style={{ color: 'var(--text-3)', fontWeight: 400 }}>
    {children}
  </p>
)
const Divider = () => <div className="my-6" style={{ borderTop: '1px solid var(--line)' }} />

const sections = ['账户', '通知', '危险操作']

export function SettingsPage() {
  const { user, logout, addToast } = useStore()
  const navigate = useNavigate()
  const [active, setActive] = useState('账户')
  const [name, setName] = useState(user?.name || '')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [pushTime, setPushTime] = useState('08:00')
  const [pushCount, setPushCount] = useState('3')
  const [deleteEmail, setDeleteEmail] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSaveName = () => {
    useStore.getState().setUser({ ...user, name })
    addToast({ message: '已保存' })
  }
  const handleLogout = () => { logout(); navigate('/auth') }
  const handleDelete = () => {
    if (deleteEmail !== user?.email) { addToast({ message: '邮箱不匹配' }); return }
    addToast({ message: '注销申请已提交，7 天后生效' })
    setShowDeleteModal(false)
    setTimeout(() => { logout(); navigate('/auth') }, 2000)
  }

  return (
    <div className="flex h-full">
      {/* Left nav */}
      <aside
        className="w-44 flex-shrink-0 px-3 py-5 flex flex-col gap-0.5"
        style={{ borderRight: '1px solid var(--line)' }}
      >
        {sections.map(s => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className="text-left px-3 py-2.5 rounded-lg text-xs font-light tracking-wide w-full transition-all duration-200"
            style={{
              background: active === s ? 'var(--bg-2)' : 'none',
              color: active === s ? 'var(--text-1)' : 'var(--text-3)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '0.02em',
            }}
          >
            {s}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-7 max-w-md">

        {active === '账户' && (
          <div className="anim-fade">
            <h2
              className="font-display text-xl mb-7"
              style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}
            >
              账户信息
            </h2>
            <div className="space-y-5">
              <div>
                <Label>昵称</Label>
                <div className="flex gap-2">
                  <input
                    className="m-input"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="设置昵称"
                    style={{ fontSize: 13, fontWeight: 400 }}
                  />
                  <button
                    className="m-btn m-btn-primary text-xs flex-shrink-0"
                    onClick={handleSaveName}
                    style={{ padding: '10px 18px', letterSpacing: '0.04em' }}
                  >
                    保存
                  </button>
                </div>
              </div>
              <div>
                <Label>邮箱</Label>
                <div
                  className="m-input text-xs font-light"
                  style={{ cursor: 'default', opacity: 0.6, display: 'flex', alignItems: 'center' }}
                >
                  {user?.email}
                </div>
              </div>
              <div>
                <Label>登录方式</Label>
                <p className="text-xs font-light" style={{ color: 'var(--text-2)', lineHeight: 1.8 }}>
                  {user?.provider === 'google' ? 'Google OAuth' : 'Magic Link（邮箱无密码登录）'}
                </p>
              </div>
              <Divider />
              <button
                className="m-btn m-btn-ghost text-xs"
                onClick={handleLogout}
                style={{ letterSpacing: '0.04em' }}
              >
                退出登录
              </button>
            </div>
          </div>
        )}

        {active === '通知' && (
          <div className="anim-fade">
            <h2 className="font-display text-xl mb-7" style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}>
              推送通知
            </h2>
            <div className="space-y-6">
              {/* Status */}
              <div
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'var(--bg-2)', border: '1px solid var(--line)' }}
              >
                <div>
                  <p className="text-xs font-light mb-0.5" style={{ color: 'var(--text-1)' }}>Web Push 通知</p>
                  <p className="text-[9px] tracking-wide" style={{ color: 'var(--text-3)' }}>需要浏览器授权</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-2)' }} />
                  <span className="text-[9px] tracking-[0.1em] uppercase" style={{ color: 'var(--accent-2)' }}>已授权</span>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-light mb-0.5" style={{ color: 'var(--text-1)' }}>每日回顾推送</p>
                  <p className="text-[9px] tracking-wide" style={{ color: 'var(--text-3)' }}>主动唤醒沉睡资产</p>
                </div>
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className="relative transition-colors duration-300"
                  style={{
                    width: 40, height: 22, borderRadius: 99,
                    background: pushEnabled ? 'var(--accent)' : 'var(--bg-3)',
                    border: 'none', cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <div
                    className="absolute top-0.5 w-[18px] h-[18px] rounded-full transition-all duration-300"
                    style={{
                      background: 'white',
                      left: pushEnabled ? 'calc(100% - 20px)' : '2px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Time */}
              <div style={{ opacity: pushEnabled ? 1 : 0.35, transition: 'opacity 0.3s', pointerEvents: pushEnabled ? 'auto' : 'none' }}>
                <Label>推送时间</Label>
                <input
                  type="time"
                  className="m-input"
                  value={pushTime}
                  onChange={e => setPushTime(e.target.value)}
                  style={{ fontSize: 13, fontWeight: 400 }}
                />
              </div>

              {/* Count */}
              <div style={{ opacity: pushEnabled ? 1 : 0.35, transition: 'opacity 0.3s', pointerEvents: pushEnabled ? 'auto' : 'none' }}>
                <Label>每日推送数量</Label>
                <div className="flex gap-2">
                  {['1', '3', '5'].map(n => (
                    <button
                      key={n}
                      onClick={() => setPushCount(n)}
                      className="flex-1 py-2.5 rounded-lg text-xs font-light transition-all duration-200"
                      style={{
                        background: pushCount === n ? 'var(--accent)' : 'var(--bg-2)',
                        color: pushCount === n ? 'white' : 'var(--text-2)',
                        border: `1px solid ${pushCount === n ? 'var(--accent)' : 'var(--line)'}`,
                        cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
                      }}
                    >
                      {n} 张
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="m-btn m-btn-primary text-xs"
                onClick={() => addToast({ message: '推送设置已保存' })}
                style={{ letterSpacing: '0.06em' }}
              >
                保存设置
              </button>
            </div>
          </div>
        )}

        {active === '危险操作' && (
          <div className="anim-fade">
            <h2 className="font-display text-xl mb-2" style={{ color: 'var(--text-1)', fontWeight: 400, fontStyle: 'italic' }}>
              危险操作
            </h2>
            <p className="text-[10px] font-light mb-7 tracking-wide" style={{ color: 'var(--text-3)', lineHeight: 1.9 }}>
              以下操作不可逆，请谨慎执行。
            </p>
            <div
              className="p-5 rounded-xl"
              style={{ background: 'rgba(160,96,96,0.04)', border: '1px solid rgba(160,96,96,0.12)' }}
            >
              <p className="text-xs font-light mb-1.5" style={{ color: '#A06060' }}>注销账户</p>
              <p className="text-[10px] font-light leading-relaxed mb-4" style={{ color: 'var(--text-3)', lineHeight: 1.9 }}>
                所有卡片、标签和设置将在 7 天冷静期后永久删除。
              </p>
              <button
                className="m-btn m-btn-danger text-xs"
                onClick={() => setShowDeleteModal(true)}
                style={{ fontSize: 11, letterSpacing: '0.04em' }}
              >
                申请注销
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete modal */}
      {showDeleteModal && (
        <div className="m-overlay" onClick={() => setShowDeleteModal(false)}>
          <div
            className="anim-drift w-full max-w-sm mx-4"
            style={{
              background: 'var(--bg)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--radius-xl)',
              padding: '28px',
              boxShadow: 'var(--shadow-lg)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-display text-lg mb-2" style={{ color: '#A06060', fontWeight: 400, fontStyle: 'italic' }}>
              确认注销账户
            </h3>
            <p className="text-xs leading-relaxed mb-5" style={{ color: 'var(--text-3)', lineHeight: 1.9 }}>
              请输入登录邮箱确认。7 天冷静期内仍可取消注销。
            </p>
            <input
              className="m-input mb-5"
              placeholder={user?.email}
              value={deleteEmail}
              onChange={e => setDeleteEmail(e.target.value)}
              style={{ fontSize: 13, fontWeight: 400 }}
            />
            <div className="flex gap-2 justify-end">
              <button className="m-btn m-btn-ghost text-xs" style={{ padding: '8px 18px' }} onClick={() => setShowDeleteModal(false)}>取消</button>
              <button className="m-btn m-btn-danger text-xs" style={{ padding: '8px 18px' }} onClick={handleDelete}>确认注销</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

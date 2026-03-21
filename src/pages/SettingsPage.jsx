import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

const sections = ['账户', '通知', '危险操作']

export function SettingsPage() {
  const { user, updateUser, logout, addToast } = useStore()
  const navigate = useNavigate()
  const [active, setActive] = useState('账户')
  const [name, setName] = useState(user?.name || '')
  const [pushEnabled, setPushEnabled] = useState(true)
  const [pushTime, setPushTime] = useState('08:00')
  const [pushCount, setPushCount] = useState('3')
  const [deleteConfirmEmail, setDeleteConfirmEmail] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const handleSaveName = () => {
    useStore.getState().setUser({ ...user, name })
    addToast({ message: '昵称已保存' })
  }

  const handleLogout = () => {
    logout()
    navigate('/auth')
  }

  const handleDelete = () => {
    if (deleteConfirmEmail !== user?.email) {
      addToast({ message: '邮箱不匹配，请重新输入' })
      return
    }
    addToast({ message: '注销申请已提交，7 天冷静期后数据将被清除' })
    setShowDeleteModal(false)
    setTimeout(() => { logout(); navigate('/auth') }, 2000)
  }

  return (
    <div className="flex h-full">
      {/* Left nav */}
      <aside className="w-44 flex-shrink-0 px-3 py-6 flex flex-col gap-0.5" style={{ borderRight: '1px solid var(--border)' }}>
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => setActive(s)}
            className="text-left px-3 py-2.5 rounded-xl text-sm transition-all w-full"
            style={{
              background: active === s ? 'var(--accent-pale)' : 'none',
              color: active === s ? 'var(--accent)' : 'var(--text-secondary)',
              border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontWeight: active === s ? 500 : 300,
            }}
          >
            {s}
          </button>
        ))}
      </aside>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 max-w-lg">
        {active === '账户' && (
          <div className="animate-fade-up">
            <h2 className="text-base font-medium mb-6" style={{ color: 'var(--text-primary)' }}>账户信息</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>昵称</label>
                <div className="flex gap-2">
                  <input
                    className="input-field"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="设置你的昵称"
                  />
                  <button className="btn-primary flex-shrink-0" onClick={handleSaveName}>保存</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>邮箱</label>
                <div className="input-field" style={{ cursor: 'default', opacity: 0.7 }}>{user?.email}</div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>登录方式</label>
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {user?.provider === 'google' ? (
                    <><span>🔑</span><span>Google OAuth</span></>
                  ) : (
                    <><span>📬</span><span>Magic Link（邮箱无密码登录）</span></>
                  )}
                </div>
              </div>
              <div className="pt-2">
                <button className="btn-ghost" onClick={handleLogout}>退出登录</button>
              </div>
            </div>
          </div>
        )}

        {active === '通知' && (
          <div className="animate-fade-up">
            <h2 className="text-base font-medium mb-6" style={{ color: 'var(--text-primary)' }}>推送通知</h2>
            <div className="space-y-5">
              {/* Push status */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Web Push 通知</p>
                    <p className="text-xs font-light mt-0.5" style={{ color: 'var(--text-ghost)' }}>需要浏览器授权</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: 'var(--accent)' }} />
                    <span className="text-xs" style={{ color: 'var(--accent)' }}>已授权</span>
                  </div>
                </div>
              </div>

              {/* Master toggle */}
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>开启每日回顾推送</p>
                  <p className="text-xs font-light mt-0.5" style={{ color: 'var(--text-ghost)' }}>每天主动唤醒你的沉睡资产</p>
                </div>
                <button
                  onClick={() => setPushEnabled(!pushEnabled)}
                  className="w-11 h-6 rounded-full relative transition-colors"
                  style={{
                    background: pushEnabled ? 'var(--accent)' : 'var(--border)',
                    border: 'none', cursor: 'pointer',
                  }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                    style={{
                      background: 'white',
                      left: pushEnabled ? 'calc(100% - 22px)' : '2px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                    }}
                  />
                </button>
              </div>

              {/* Time */}
              <div style={{ opacity: pushEnabled ? 1 : 0.4, pointerEvents: pushEnabled ? 'auto' : 'none' }}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>推送时间</label>
                <input
                  type="time"
                  className="input-field"
                  value={pushTime}
                  onChange={(e) => setPushTime(e.target.value)}
                />
              </div>

              {/* Count */}
              <div style={{ opacity: pushEnabled ? 1 : 0.4, pointerEvents: pushEnabled ? 'auto' : 'none' }}>
                <label className="block text-xs font-medium mb-2 uppercase tracking-wider" style={{ color: 'var(--text-ghost)' }}>每日推送数量</label>
                <div className="flex gap-2">
                  {['1', '3', '5'].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPushCount(n)}
                      className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: pushCount === n ? 'var(--accent)' : 'var(--bg-deep)',
                        color: pushCount === n ? 'white' : 'var(--text-secondary)',
                        border: `1px solid ${pushCount === n ? 'var(--accent)' : 'var(--border)'}`,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {n} 张
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary" onClick={() => addToast({ message: '推送设置已保存' })}>
                保存设置
              </button>
            </div>
          </div>
        )}

        {active === '危险操作' && (
          <div className="animate-fade-up">
            <h2 className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>危险操作</h2>
            <p className="text-xs font-light mb-6 leading-relaxed" style={{ color: 'var(--text-ghost)' }}>以下操作不可逆，请谨慎操作。</p>
            <div className="glass-card p-5" style={{ borderColor: 'rgba(192,57,43,0.15)' }}>
              <h3 className="text-sm font-medium mb-1.5" style={{ color: '#C0392B' }}>注销账户</h3>
              <p className="text-xs font-light leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                注销后，你的所有卡片、标签和设置将在 7 天冷静期后永久删除，无法恢复。
              </p>
              <button className="btn-danger" onClick={() => setShowDeleteModal(true)}>
                申请注销账户
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="glass-card p-6 w-full max-w-sm mx-4 animate-slide-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-medium mb-2" style={{ color: '#C0392B' }}>确认注销账户</h3>
            <p className="text-xs font-light leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              请输入你的登录邮箱以确认注销操作。7 天冷静期内你仍可登录并取消注销。
            </p>
            <input
              className="input-field mb-4"
              placeholder={user?.email}
              value={deleteConfirmEmail}
              onChange={(e) => setDeleteConfirmEmail(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>取消</button>
              <button className="btn-danger" onClick={handleDelete}>确认注销</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

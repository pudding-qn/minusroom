import useStore from '../../store/useStore'

export function Toast() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto anim-slide-r"
          style={{
            background: 'var(--surface)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 16px',
            fontSize: 12,
            fontWeight: 400,
            letterSpacing: '0.02em',
            color: 'var(--text-2)',
            boxShadow: 'var(--shadow-md)',
            minWidth: 180,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

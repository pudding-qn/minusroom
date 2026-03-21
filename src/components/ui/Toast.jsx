import useStore from '../../store/useStore'

export function Toast() {
  const toasts = useStore((s) => s.toasts)
  return (
    <div className="fixed top-5 right-5 z-[300] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-toast-in pointer-events-auto glass-card px-4 py-3 text-sm flex items-center gap-2 min-w-[200px]"
          style={{ color: 'var(--text-primary)', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }}
        >
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  )
}

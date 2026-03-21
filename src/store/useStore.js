import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_CARDS, DAILY_DIGEST_IDS } from '../data/mockCards'

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),

      // Theme
      theme: 'light',
      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        set({ theme: next })
        document.documentElement.classList.toggle('dark', next === 'dark')
      },

      // Cards
      cards: MOCK_CARDS,
      addCard: (card) => set((s) => ({ cards: [card, ...s.cards] })),
      updateCard: (id, updates) =>
        set((s) => ({
          cards: s.cards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      deleteCard: (id) =>
        set((s) => ({ cards: s.cards.filter((c) => c.id !== id) })),
      getCard: (id) => get().cards.find((c) => c.id === id),

      // Filters
      selectedTags: [],
      toggleTag: (tag) =>
        set((s) => ({
          selectedTags: s.selectedTags.includes(tag)
            ? s.selectedTags.filter((t) => t !== tag)
            : [...s.selectedTags, tag],
        })),
      clearTags: () => set({ selectedTags: [] }),

      // Search
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Daily Digest
      digestDismissedDate: null,
      dismissDigest: () =>
        set({ digestDismissedDate: new Date().toDateString() }),
      isDigestVisible: () => {
        const today = new Date().toDateString()
        return get().digestDismissedDate !== today
      },
      digestCardIds: DAILY_DIGEST_IDS,

      // Toast
      toasts: [],
      addToast: (toast) => {
        const id = Date.now().toString()
        set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }))
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
        }, 3500)
      },

      // Capture modal
      captureOpen: false,
      openCapture: () => set({ captureOpen: true }),
      closeCapture: () => set({ captureOpen: false }),

      // Search overlay
      searchOpen: false,
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),
    }),
    {
      name: 'minusroom-store',
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        cards: s.cards,
        digestDismissedDate: s.digestDismissedDate,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)

export default useStore

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MOCK_CARDS, DAILY_DIGEST_IDS } from '../data/mockCards'

// Bump this version whenever mock data changes — forces cache refresh
const STORE_VERSION = 3

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

      // Search overlay (legacy, kept for SearchOverlay component)
      searchOpen: false,
      openSearch: () => set({ searchOpen: true }),
      closeSearch: () => set({ searchOpen: false }),

      // Knowledge drawer
      drawerOpen: false,
      drawerMode: 'local', // 'local' | 'online'
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
      toggleDrawerMode: () => set((s) => ({ drawerMode: s.drawerMode === 'local' ? 'online' : 'local' })),

      // Chat sessions (persisted)
      chatSessions: [],       // [{ id, title, messages, mode, createdAt, updatedAt }]
      activeChatId: null,     // current session id, null = new unsaved chat
      lastChatTimestamp: null, // ISO string — last time user sent a message

      createChatSession: (mode) => {
        const id = 'chat-' + Date.now().toString(36)
        const now = new Date().toISOString()
        const session = { id, title: '新对话', messages: [], mode: mode || 'local', createdAt: now, updatedAt: now }
        set((s) => ({ chatSessions: [session, ...s.chatSessions], activeChatId: id }))
        return id
      },
      updateChatSession: (id, messages) => {
        const now = new Date().toISOString()
        set((s) => {
          const sessions = s.chatSessions.map(sess => {
            if (sess.id !== id) return sess
            // Auto-title from first user message
            const firstUser = messages.find(m => m.role === 'user')
            const title = firstUser ? firstUser.text.slice(0, 24) + (firstUser.text.length > 24 ? '…' : '') : sess.title
            return { ...sess, messages, title, updatedAt: now }
          })
          return { chatSessions: sessions, lastChatTimestamp: now }
        })
      },
      deleteChatSession: (id) => set((s) => ({
        chatSessions: s.chatSessions.filter(sess => sess.id !== id),
        activeChatId: s.activeChatId === id ? null : s.activeChatId,
      })),
      setActiveChatId: (id) => set({ activeChatId: id }),
    }),
    {
      name: 'minusroom-store',
      version: STORE_VERSION,
      partialize: (s) => ({
        user: s.user,
        theme: s.theme,
        cards: s.cards,
        digestDismissedDate: s.digestDismissedDate,
        chatSessions: s.chatSessions,
        activeChatId: s.activeChatId,
        lastChatTimestamp: s.lastChatTimestamp,
      }),
      migrate: (persisted, version) => {
        // When version changes, reset cards to latest mock data
        if (version < STORE_VERSION) {
          return { ...persisted, cards: MOCK_CARDS }
        }
        return persisted
      },
      onRehydrateStorage: () => (state) => {
        if (state?.theme === 'dark') {
          document.documentElement.classList.add('dark')
        }
      },
    }
  )
)

export default useStore

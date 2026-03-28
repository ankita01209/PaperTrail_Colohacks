import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'clerk' | 'admin' | null;

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: Role;
  created_at?: string;
}

interface AppState {
  user: UserProfile | null;
  role: Role;
  sessionId: string | null;
  setUser: (user: UserProfile | null) => void;
  setRole: (role: Role) => void;
  setSessionId: (id: string | null) => void;
  clearSession: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      sessionId: null,
      setUser: (user) => set({ user }),
      setRole: (role) => set({ role }),
      setSessionId: (id) => set({ sessionId: id }),
      clearSession: () => set({ sessionId: null }),
      logout: () => set({ user: null, role: null, sessionId: null })
    }),
    {
      name: 'pt-state',
      partialize: (state) => ({ sessionId: state.sessionId, user: state.user, role: state.role }),
    }
  )
);

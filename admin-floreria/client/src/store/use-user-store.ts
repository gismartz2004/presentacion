import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import type { Feature } from './types';

export type User = {
  id: string;
  email: string;
  name: string;
  // Rol actual del usuario (simple). A futuro puedes migrar a roles: string[]
  role?: string;
  // Agrega más campos si tu API /me los retorna
};

interface UserState {
  user: User | null;
  // Timestamp del último fetch exitoso (ms since epoch)
  lastFetchedAt: number;
  // Bandera que indica que el store fue hidratado desde el storage
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  markFetchedNow: () => void;
  setHydrated: (v: boolean) => void;
  features: Feature[];
  setFeatures: (features: Feature[]) => void;
}

export const useUserStore = create<UserState>()(
  subscribeWithSelector(
    persist(
      (set) => ({
        user: null,
        lastFetchedAt: 0,
        isHydrated: false,
        setUser: (user) => set({ user }),
        clearUser: () => set({ user: null, lastFetchedAt: 0, features: [] }),
        markFetchedNow: () => set({ lastFetchedAt: Date.now() }),
        setHydrated: (v) => set({ isHydrated: v }),
        features: [],
        setFeatures: (features) => set({ features }),
      }),
      {
        name: 'user-store',
        partialize: (state) => ({ user: state.user, lastFetchedAt: state.lastFetchedAt, features: state.features }),
        onRehydrateStorage: () => (state) => {
          // Marca hidratado cuando termine la rehidratación
          state?.setHydrated(true);
        },
      }
    )
  )
);

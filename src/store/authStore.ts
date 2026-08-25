import { create } from 'zustand';
import type { Account } from '@/platform/ports';

interface AuthState {
  account: Account | null;
  setAccount: (account: Account | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  account: null,
  setAccount: (account) => set({ account }),
}));

import { create } from 'zustand';

type Theme = 'light' | 'dark';
type Period = '7d' | '30d' | '90d';

const getPreferredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'dark';
  const saved = window.localStorage.getItem('theme');
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

type UiState = {
  theme: Theme;
  period: Period;
  sidebarOpen: boolean;
  setTheme: (theme: Theme) => void;
  setPeriod: (period: Period) => void;
  setSidebarOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>((set) => ({
  theme: getPreferredTheme(),
  period: '7d',
  sidebarOpen: false,
  setTheme: (theme) => set({ theme }),
  setPeriod: (period) => set({ period }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));


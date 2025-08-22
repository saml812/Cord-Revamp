import { create } from "zustand";
interface ThemeState {
  theme: string;
  setTheme: (theme: string) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: localStorage.getItem("chat-theme") || "dracula",
  setTheme: (theme: any) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
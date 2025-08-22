import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "dracula",
  setTheme: (theme: any) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
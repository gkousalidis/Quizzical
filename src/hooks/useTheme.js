import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

function getSystemTheme() {
  const prefersDark =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

// null = the user never chose, so follow the OS setting
export function useTheme() {
  const [saved, setSaved] = useLocalStorage("quizzical-theme", null);
  const theme = saved ?? getSystemTheme();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function toggleTheme() {
    setSaved(theme === "dark" ? "light" : "dark");
  }

  return { theme, toggleTheme };
}

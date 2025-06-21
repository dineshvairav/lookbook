
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

// A simple theme toggle hook (could be replaced by next-themes or similar)
const useTheme = () => {
  // The initial state is 'light' to match the server, and useEffect syncs it.
  const [theme, setThemeState] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    // On mount, sync the React state with the DOM state set by the inline script.
    const isDark = document.documentElement.classList.contains("dark");
    setThemeState(isDark ? "dark" : "light");
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
    // When the user makes a choice, store it in localStorage.
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
  };

  return { theme, setTheme };
};


export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  // Prevent rendering on server to avoid hydration mismatch
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
  }

  return (
    <button
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-md hover:bg-accent/50 transition-colors"
    >
      {theme === "light" ? (
        <Sun className="h-5 w-5 text-accent" />
      ) : (
        <Moon className="h-5 w-5 text-accent" />
      )}
    </button>
  );
}

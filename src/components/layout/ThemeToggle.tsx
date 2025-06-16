"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";

// A simple theme toggle hook (could be replaced by next-themes or similar)
const useTheme = () => {
  const [theme, setThemeState] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (storedTheme) {
      setThemeState(storedTheme);
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else if (systemPrefersDark) {
      setThemeState("dark");
      document.documentElement.classList.add("dark");
    } else {
       setThemeState("light");
       document.documentElement.classList.remove("dark");
    }
  }, []);

  const setTheme = (newTheme: "light" | "dark") => {
    setThemeState(newTheme);
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
        <Sun className="h-5 w-5 text-accent-foreground" />
      ) : (
        <Moon className="h-5 w-5 text-accent-foreground" />
      )}
    </button>
  );
}

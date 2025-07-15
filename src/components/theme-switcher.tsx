
"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "theme";

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedTheme = localStorage.getItem(THEME_KEY);
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem(THEME_KEY, "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem(THEME_KEY, "light");
      }
    }
  }, [theme, isMounted]);


  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  if (!isMounted) {
    return (
      <div className="fixed top-2 right-2 z-50">
        <div className="h-10 w-10 rounded-md bg-muted animate-pulse" />
      </div>
    );
  }

  return (
    <div className="fixed top-2 right-2 z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="shadow-md"
      >
        {theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
}

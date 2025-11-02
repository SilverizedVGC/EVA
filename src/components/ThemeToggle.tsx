"use client";
import { useTheme } from "next-themes"
import { Button } from "./ui/button"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isMounted = typeof window !== "undefined"

    if (!isMounted) {
      return null
    }
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      {theme === 'light' ? <Moon /> : <Sun />}
    </Button>
  )
}
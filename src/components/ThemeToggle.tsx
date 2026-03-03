import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "./ui/button";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    function toggleTheme() {
        setTheme(theme === "light" ? "dark" : "light");
    }

    return (
        <Button variant='outline' onClick={toggleTheme} aria-label="Toggle theme" className="shadow-sm">
            {theme === "dark" ? <Moon className="text-blue-500" /> : <Sun className="text-amber-500" />}
        </Button>
    );
}

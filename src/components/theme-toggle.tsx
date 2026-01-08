"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const cycleTheme = () => {
        if (theme === "light") {
            setTheme("dark");
        } else if (theme === "dark") {
            setTheme("system");
        } else {
            setTheme("light");
        }
    };

    const getIcon = () => {
        switch (theme) {
            case "light":
                return <Sun className="h-4 w-4" />;
            case "dark":
                return <Moon className="h-4 w-4" />;
            default:
                return <Monitor className="h-4 w-4" />;
        }
    };

    const getTitle = () => {
        switch (theme) {
            case "light":
                return "Mode Terang";
            case "dark":
                return "Mode Gelap";
            default:
                return "Ikuti Sistem";
        }
    };

    return (
        <button
            onClick={cycleTheme}
            className="p-2 rounded-lg text-emerald-200 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Toggle theme"
            title={getTitle()}
        >
            {getIcon()}
        </button>
    );
}


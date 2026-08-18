import { Heart, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Theme } from "@/hooks/useTheme";

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  favoritesCount: number;
  showFavoritesOnly: boolean;
  onToggleFavoritesOnly: () => void;
}

/**
 * The bezel controls — the hardware buttons beside the wordmark.
 *
 * These sit on the casing rather than on the screen, so they are moulded
 * parts: panel-filled with a hard outline, and they travel into their own
 * shadow when pressed. Filling them with the panel colour (not a tint of the
 * casing) is what keeps them legible on Ultra's near-black shell.
 */
export function Header({
  theme,
  onToggleTheme,
  favoritesCount,
  showFavoritesOnly,
  onToggleFavoritesOnly,
}: HeaderProps) {
  const button =
    "pd-press inline-flex items-center justify-center gap-2 rounded-[10px] border-[3px] border-[var(--pd-black)] text-sm font-semibold";

  return (
    <>
      <button
        type="button"
        onClick={onToggleFavoritesOnly}
        aria-pressed={showFavoritesOnly}
        className={cn(button, "h-10 px-3")}
        style={
          showFavoritesOnly
            ? { background: "var(--pd-accent)", color: "var(--pd-accent-ink)" }
            : { background: "rgb(var(--surface))", color: "rgb(var(--ink))" }
        }
      >
        <Heart className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
        <span className="hidden sm:inline">Favorites</span>
        <span className="font-mono text-xs tabular-nums">{favoritesCount}</span>
      </button>

      <button
        type="button"
        onClick={onToggleTheme}
        aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        className={cn(button, "h-10 w-10")}
        style={{ background: "rgb(var(--surface))", color: "rgb(var(--ink))" }}
      >
        {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </>
  );
}

import { Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Drop the `/` hint. The device's open half is too narrow to carry both it
      and a readable placeholder; the shortcut still works without the label. */
  narrow?: boolean;
}

/** Search by name. Press / anywhere to jump here, Escape to clear. */
export function SearchBar({ value, onChange, narrow = false }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (event.key === "/" && !isTyping) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div
      /* A recessed field cut into the casing: inset shading rather than a
         drop, because the search slot sits *into* the shell, not on it. */
      className={cn(
        "slot flex h-12 w-full items-center gap-3 px-4",
        "focus-within:ring-2 focus-within:ring-white/60",
      )}
    >
      <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden />
      <input
        ref={inputRef}
        type="search"
        value={value}
        /* Short enough to survive the device's narrow half without ellipsing;
           the accessible name below still says what it searches. */
        placeholder="Search Pokémon"
        aria-label="Search Pokémon by name"
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value) {
            event.stopPropagation();
            onChange("");
          }
        }}
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-ink/[0.08] hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      ) : narrow ? null : (
        <kbd className="readout hidden shrink-0 rounded border-2 border-[var(--pd-black)] px-1.5 py-0.5 sm:block">
          /
        </kbd>
      )}
    </div>
  );
}

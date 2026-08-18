import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import type { PokemonSummary } from "@/types/pokemon";

interface CompareTrayProps {
  selection: PokemonSummary[];
  onRemove: (name: string) => void;
  onClear: () => void;
  onCompare: () => void;
}

/**
 * Docked tray showing the compare selection. Hidden until something is picked.
 *
 * A centred pill on a wide screen, a full-width bar on a phone: at 375px the
 * pill's contents came to well over the viewport, and because the tray is
 * centred in a fixed layer it overflowed off *both* edges without ever
 * growing the document — so the clear button simply was not reachable.
 */
export function CompareTray({ selection, onRemove, onClear, onCompare }: CompareTrayProps) {
  if (selection.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-2 sm:p-4">
      <div
        className={[
          "pointer-events-auto flex w-full animate-fade-up border-[3px] border-[var(--pd-black)] bg-surface shadow-panel",
          /* Two rows on a phone — chips above, actions below — rather than one
             scrolling row: with the selection capped at two there is nothing
             to scroll to, so a cut-off second chip would just look broken. */
          "flex-col gap-2 rounded-[18px] p-2",
          "sm:w-auto sm:flex-row sm:items-center sm:gap-3 sm:rounded-full sm:pl-4",
        ].join(" ")}
      >
        <span className="readout hidden sm:block">Compare</span>

        {/* The chips are the one part that can grow without bound, so they are
            what gives way — they scroll, and the actions beside them stay
            put and reachable. */}
        <ul className="flex min-w-0 flex-wrap items-center gap-2 sm:flex-nowrap">
          {selection.map((pokemon) => (
            <li
              key={pokemon.name}
              style={typeVars(pokemon.types)}
              className="flex min-w-0 items-center gap-1.5 rounded-full border-2 border-[var(--pd-black)] bg-[rgb(var(--type-rgb)/0.16)] py-1 pl-1.5 pr-2"
            >
              {pokemon.sprite ? (
                <img src={pokemon.sprite} alt="" width={28} height={28} className="h-7 w-7" />
              ) : null}
              <span className="max-w-[8rem] truncate text-sm font-medium">
                {formatName(pokemon.name)}
              </span>
              <button
                type="button"
                onClick={() => onRemove(pokemon.name)}
                aria-label={`Remove ${formatName(pokemon.name)} from compare`}
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>

        {/* On a phone the actions get their own row, so the group has to
            carry its own alignment; in the pill they are just the tail. */}
        <div className="flex items-center justify-end gap-2 sm:contents">
          {selection.length < 2 ? (
            <span className="mr-auto text-sm text-muted sm:mr-0">Pick one more</span>
          ) : null}

          <Button
            variant="solid"
            size="sm"
            onClick={onCompare}
            disabled={selection.length < 2}
            className="shrink-0"
          >
            Compare
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClear}
            aria-label="Clear compare selection"
            className="shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

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

/** Docked tray showing the compare selection. Hidden until something is picked. */
export function CompareTray({ selection, onRemove, onClear, onCompare }: CompareTrayProps) {
  if (selection.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center p-4">
      <div className="pointer-events-auto flex animate-fade-up items-center gap-3 rounded-full border-[3px] border-[var(--pd-black)] bg-surface p-2 pl-4 shadow-panel">
        <span className="readout hidden sm:block">Compare</span>

        <ul className="flex items-center gap-2">
          {selection.map((pokemon) => (
            <li
              key={pokemon.name}
              style={typeVars(pokemon.types)}
              className="flex items-center gap-1.5 rounded-full border-2 border-[var(--pd-black)] bg-[rgb(var(--type-rgb)/0.16)] py-1 pl-1.5 pr-2"
            >
              {pokemon.sprite ? (
                <img src={pokemon.sprite} alt="" width={28} height={28} className="h-7 w-7" />
              ) : null}
              <span className="text-sm font-medium">{formatName(pokemon.name)}</span>
              <button
                type="button"
                onClick={() => onRemove(pokemon.name)}
                aria-label={`Remove ${formatName(pokemon.name)} from compare`}
                className="grid h-5 w-5 place-items-center rounded-full text-muted transition-colors hover:bg-ink/10 hover:text-ink"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>

        {selection.length < 2 ? (
          <span className="hidden text-sm text-muted sm:block">Pick one more</span>
        ) : null}

        <Button variant="solid" size="sm" onClick={onCompare} disabled={selection.length < 2}>
          Compare
        </Button>
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear compare selection">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

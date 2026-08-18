import { Heart, GitCompareArrows } from "lucide-react";
import { Link } from "react-router-dom";
import { TypeChip } from "@/components/TypeChip";
import { formatDexNumber, formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import type { PokemonSummary } from "@/types/pokemon";

interface PokemonCardProps {
  pokemon: PokemonSummary;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
  isSelectedForCompare: boolean;
  onToggleCompare: (pokemon: PokemonSummary) => void;
  /** Index within the page, used to stagger the entrance. */
  index: number;
}

export function PokemonCard({
  pokemon,
  isFavorite,
  onToggleFavorite,
  isSelectedForCompare,
  onToggleCompare,
  index,
}: PokemonCardProps) {
  const { id, name, types, sprite, stats } = pokemon;

  return (
    <article
      style={{ ...typeVars(types), animationDelay: `${Math.min(index, 11) * 35}ms` }}
      className={cn(
        "group relative isolate animate-fade-up overflow-hidden rounded-card border-[3px] border-[var(--pd-black)] bg-surface",
        "shadow-card transition-[transform,box-shadow] duration-200",
        "hover:-translate-y-1 hover:shadow-lift",
      )}
    >
      {/* Type signature: a two-tone rule across the top edge. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-[6px] border-b-[3px] border-[var(--pd-black)]"
        style={{
          background:
            "linear-gradient(90deg, rgb(var(--type-rgb)) 0%, rgb(var(--type-rgb-2)) 100%)",
        }}
      />

      <div className="flex items-start justify-between px-3 pt-3 sm:px-5 sm:pt-5">
        <span className="readout text-[10px] tracking-[0.16em] sm:text-[11px] sm:tracking-[0.18em]">
          {formatDexNumber(id)}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onToggleCompare(pokemon)}
            aria-pressed={isSelectedForCompare}
            aria-label={
              isSelectedForCompare
                ? `Remove ${formatName(name)} from compare`
                : `Add ${formatName(name)} to compare`
            }
            className={cn(
              "relative z-20 grid h-9 w-9 place-items-center rounded-full transition-colors coarse:h-10 coarse:w-10",
              isSelectedForCompare
                ? "bg-ink text-canvas"
                : "text-muted/70 hover:bg-ink/[0.06] hover:text-ink",
            )}
          >
            <GitCompareArrows className="h-[15px] w-[15px]" />
          </button>
          <button
            type="button"
            onClick={() => onToggleFavorite(name)}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite ? `Unfavorite ${formatName(name)}` : `Favorite ${formatName(name)}`
            }
            className={cn(
              "relative z-20 grid h-9 w-9 place-items-center rounded-full transition-colors coarse:h-10 coarse:w-10",
              isFavorite
                ? "text-signal"
                : "text-muted hover:bg-ink/[0.06] hover:text-ink",
            )}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        </div>
      </div>

      {/* Containment halo — the card's signature element. */}
      <div className="relative mx-auto grid h-28 w-full place-items-center sm:h-40">
        <div className="halo absolute inset-x-4 inset-y-0 rounded-full sm:inset-x-6" aria-hidden />
        <div
          className="halo-ring inset-y-1 aspect-square group-hover:scale-[1.07]"
          aria-hidden
        />
        <div
          className="halo-ring inset-y-6 aspect-square opacity-70 group-hover:scale-[1.12]"
          aria-hidden
        />
        {sprite ? (
          <img
            src={sprite}
            alt={formatName(name)}
            loading="lazy"
            decoding="async"
            width={160}
            height={160}
            className="relative z-10 h-24 w-24 object-contain sm:h-32 sm:w-32 drop-shadow-[0_10px_18px_rgb(var(--type-rgb)/0.35)] transition-transform duration-300 group-hover:-translate-y-1.5 group-hover:scale-105"
          />
        ) : (
          <span className="readout relative z-10">No artwork</span>
        )}
      </div>

      <div className="px-3 pb-3 sm:px-5 sm:pb-5">
        <h3 className="font-display text-base font-bold leading-tight tracking-tight sm:text-xl">
          {/* Stretched link keeps the whole card clickable while the buttons
              above stay independently focusable. */}
          <Link
            to={`/pokemon/${name}`}
            className="after:absolute after:inset-0 after:z-10 after:content-[''] focus-visible:outline-none"
          >
            {formatName(name)}
          </Link>
        </h3>

        <div className="mt-2 flex flex-wrap gap-1 sm:mt-2.5 sm:gap-1.5">
          {types.map((type) => (
            <TypeChip key={type} type={type} />
          ))}
        </div>

        <dl className="mt-3 grid grid-cols-3 gap-1 border-t-2 border-[var(--pd-black)] pt-2.5 sm:mt-4 sm:gap-2 sm:pt-3">
          {(
            [
              ["HP", stats.hp],
              ["ATK", stats.attack],
              ["SPD", stats.speed],
            ] as const
          ).map(([label, value]) => (
            /* Stacked on the 2-up phone card: laid out inline, the three
               label/value pairs are each wider than their column and the
               value runs into the next label. Inline again from `sm`, where
               the column is wide enough to hold the pair on one line. */
            <div
              key={label}
              className="flex min-w-0 flex-col gap-0 sm:flex-row sm:items-baseline sm:gap-1.5"
            >
              <dt className="readout text-[9px] tracking-[0.1em] sm:text-[10px] sm:tracking-[0.16em]">
                {label}
              </dt>
              <dd className="font-mono text-xs font-medium tabular-nums sm:text-sm">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </article>
  );
}

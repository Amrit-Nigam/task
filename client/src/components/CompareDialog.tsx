import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { TypeChip } from "@/components/TypeChip";
import { Button } from "@/components/ui/button";
import { formatDexNumber, formatHeight, formatName, formatWeight } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import { STAT_LABELS, type PokemonSummary, type StatKey } from "@/types/pokemon";

/**
 * Segment count for the head-to-head bars.
 *
 * Two counts, because the bar is only worth segmenting while the segments can
 * be told apart: eighteen of them across a phone's ~100px half render as 3px
 * hairlines, which reads as a solid bar with extra noise.
 */
const COMPARE_SEGMENTS = 18;
const COMPARE_SEGMENTS_COMPACT = 9;

const STAT_ORDER: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

interface CompareDialogProps {
  pair: [PokemonSummary, PokemonSummary];
  onClose: () => void;
}

/** Two Pokémon side by side, with the higher value in each row marked. */
export function CompareDialog({ pair, onClose }: CompareDialogProps) {
  const [left, right] = pair;
  const dialogRef = useRef<HTMLDivElement>(null);
  const isCompact = useMediaQuery("(max-width: 639px)");
  const segments = isCompact ? COMPARE_SEGMENTS_COMPACT : COMPARE_SEGMENTS;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const leftTotal = STAT_ORDER.reduce((sum, key) => sum + left.stats[key], 0);
  const rightTotal = STAT_ORDER.reduce((sum, key) => sum + right.stats[key], 0);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-ink/45 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${formatName(left.name)} compared with ${formatName(right.name)}`}
        tabIndex={-1}
        className="panel relative z-10 max-h-full w-full max-w-2xl animate-fade-up overflow-y-auto overscroll-contain shadow-panel outline-none"
      >
        <div className="flex items-center justify-between border-b border-edge px-5 py-3">
          <span className="readout">Head to head</span>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close comparison">
            <X className="h-[18px] w-[18px]" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 sm:gap-4 sm:p-5">
          <CompareHeader pokemon={left} />
          <CompareHeader pokemon={right} />
        </div>

        <div className="space-y-1 px-4 pb-5 sm:px-5">
          {STAT_ORDER.map((key) => (
            <CompareRow
              key={key}
              label={STAT_LABELS[key]}
              leftValue={left.stats[key]}
              rightValue={right.stats[key]}
              segments={segments}
            />
          ))}
          <CompareRow
            label="Total"
            leftValue={leftTotal}
            rightValue={rightTotal}
            segments={segments}
            emphasise
          />
          <div className="grid grid-cols-[1fr_3.75rem_1fr] items-center gap-1.5 pt-3 text-center sm:grid-cols-[1fr_5rem_1fr] sm:gap-2">
            <span className="font-mono text-xs sm:text-sm">{formatHeight(left.height)}</span>
            <span className="readout">Height</span>
            <span className="font-mono text-xs sm:text-sm">{formatHeight(right.height)}</span>
          </div>
          <div className="grid grid-cols-[1fr_3.75rem_1fr] items-center gap-1.5 text-center sm:grid-cols-[1fr_5rem_1fr] sm:gap-2">
            <span className="font-mono text-xs sm:text-sm">{formatWeight(left.weight)}</span>
            <span className="readout">Weight</span>
            <span className="font-mono text-xs sm:text-sm">{formatWeight(right.weight)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompareHeader({ pokemon }: { pokemon: PokemonSummary }) {
  return (
    <div style={typeVars(pokemon.types)} className="flex flex-col items-center text-center">
      <div className="halo grid h-24 w-full place-items-center rounded-2xl sm:h-32">
        {pokemon.sprite ? (
          <img
            src={pokemon.sprite}
            alt={formatName(pokemon.name)}
            width={112}
            height={112}
            className="h-20 w-20 object-contain sm:h-28 sm:w-28"
          />
        ) : null}
      </div>
      <span className="readout mt-2">{formatDexNumber(pokemon.id)}</span>
      <h3 className="font-display text-base font-bold sm:text-lg">{formatName(pokemon.name)}</h3>
      <div className="mt-1.5 flex flex-wrap justify-center gap-1.5">
        {pokemon.types.map((type) => (
          <TypeChip key={type} type={type} />
        ))}
      </div>
    </div>
  );
}

function CompareRow({
  label,
  leftValue,
  rightValue,
  segments,
  emphasise = false,
}: {
  label: string;
  leftValue: number;
  rightValue: number;
  segments: number;
  emphasise?: boolean;
}) {
  const max = Math.max(leftValue, rightValue, 1);

  return (
    <div
      className={cn(
        "grid grid-cols-[1fr_3.75rem_1fr] items-center gap-1.5 py-1.5 sm:grid-cols-[1fr_5rem_1fr] sm:gap-2",
        emphasise && "border-t border-edge pt-3",
      )}
    >
      <Bar
        value={leftValue}
        max={max}
        segments={segments}
        align="right"
        wins={leftValue > rightValue}
      />
      <span className="readout text-center leading-tight">{label}</span>
      <Bar
        value={rightValue}
        max={max}
        segments={segments}
        align="left"
        wins={rightValue > leftValue}
      />
    </div>
  );
}

function Bar({
  value,
  max,
  segments,
  align,
  wins,
}: {
  value: number;
  max: number;
  segments: number;
  align: "left" | "right";
  wins: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 sm:gap-2",
        align === "right" ? "flex-row-reverse" : "flex-row",
      )}
    >
      <span
        className={cn(
          "shrink-0 font-mono text-xs tabular-nums sm:text-sm",
          wins ? "font-bold text-ink" : "text-muted",
        )}
      >
        {value}
      </span>
      {/* Segmented, like the readout in the specimen record — a head-to-head
         is exactly where countable segments beat a smooth bar, because the
         question being asked is "by how many". */}
      <span
        className={cn(
          "flex flex-1 gap-[2px]",
          align === "right" ? "flex-row-reverse" : "flex-row",
        )}
      >
        {Array.from({ length: segments }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 flex-1 rounded-[2px] transition-colors duration-500",
              index < Math.max(1, Math.round((value / max) * segments))
                ? wins
                  ? "bg-ink"
                  : "bg-ink/30"
                : "bg-ink/[0.08] dark:bg-ink/[0.12]",
            )}
            style={{ transitionDelay: `${index * 12}ms` }}
          />
        ))}
      </span>
    </div>
  );
}

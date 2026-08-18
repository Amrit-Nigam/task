import { cn } from "@/lib/utils";
import { formatName } from "@/lib/format";
import { typeRgb } from "@/lib/types-theme";
import type { TypeInfo } from "@/types/pokemon";

interface TypeFilterProps {
  types: TypeInfo[];
  selected: string | null;
  onSelect: (type: string | null) => void;
  totalCount: number;
  /** Keep every pill on one scrolling row — for the device's narrow half,
      where wrapping 19 pills would eat the index list's height. */
  rail?: boolean;
}

/** A horizontally scrolling rail of type filters, each in its own hue. */
export function TypeFilter({
  types,
  selected,
  onSelect,
  totalCount,
  rail = false,
}: TypeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter by type"
      className={cn(
        "no-scrollbar flex gap-2 overflow-x-auto pb-1",
        rail ? "pr-6" : "-mx-4 px-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0",
      )}
      /* On the rail the row is cut mid-pill at the edge, which reads as broken
         rather than as scrollable. Fading the last few pixels out makes the
         cut deliberate and shows there is more to reach. */
      style={
        rail
          ? {
              maskImage:
                "linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(90deg, #000 0, #000 calc(100% - 28px), transparent 100%)",
            }
          : undefined
      }
    >
      <FilterPill
        label="All"
        count={totalCount}
        rgb="var(--signal)"
        isSelected={selected === null}
        onClick={() => onSelect(null)}
        /* "All" has no type hue of its own, so it takes the ball's accent —
           and with it `--pd-accent-ink`, which is black on Ultra's gold. The
           type pills below are always dark enough for white. */
        selectedInk="var(--pd-accent-ink)"
      />
      {types.map((type) => (
        <FilterPill
          key={type.name}
          label={formatName(type.name)}
          count={type.count}
          rgb={typeRgb(type.name)}
          isSelected={selected === type.name}
          onClick={() => onSelect(selected === type.name ? null : type.name)}
        />
      ))}
    </div>
  );
}

interface FilterPillProps {
  label: string;
  count: number;
  rgb: string;
  isSelected: boolean;
  onClick: () => void;
  selectedInk?: string;
}

function FilterPill({
  label,
  count,
  rgb,
  isSelected,
  onClick,
  selectedInk = "#ffffff",
}: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      style={
        {
          "--type-rgb": rgb,
          ...(isSelected ? { color: selectedInk } : null),
        } as React.CSSProperties
      }
      /* These sit on the casing, so an unselected pill is a moulded key —
         panel-filled with the casing outline. A translucent fill would take
         the casing colour through it and lose contrast on the darker balls. */
      className={cn(
        "pd-press group inline-flex shrink-0 items-center gap-2 rounded-full border-2 border-[var(--pd-black)] px-3.5 py-1.5 text-sm font-semibold",
        isSelected
          ? "bg-[rgb(var(--type-rgb))]"
          : "bg-surface text-ink hover:bg-[rgb(var(--type-rgb)/0.14)]",
      )}
    >
      {label}
      <span
        className={cn(
          "font-mono text-[10px] tabular-nums transition-colors",
          isSelected ? "opacity-70" : "text-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

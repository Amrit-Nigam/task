import { cn } from "@/lib/utils";

/** Base stats top out at 255, but almost everything lives below this. */
const DISPLAY_MAX = 200;
const SEGMENTS = 20;

interface StatMeterProps {
  label: string;
  value: number;
  /** Renders the meter in the Pokémon's type hue rather than plain ink. */
  tinted?: boolean;
  className?: string;
}

/**
 * A segmented readout rather than a smooth bar — it reads as an instrument
 * gauge and makes small differences between Pokémon countable at a glance.
 */
export function StatMeter({ label, value, tinted = true, className }: StatMeterProps) {
  const filled = Math.max(1, Math.round((Math.min(value, DISPLAY_MAX) / DISPLAY_MAX) * SEGMENTS));

  return (
    <div className={cn("grid grid-cols-[3.75rem_1fr_2.25rem] items-center gap-3", className)}>
      <span className="readout">{label}</span>
      <span
        className="flex gap-[3px]"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={255}
        aria-label={`${label} base stat`}
      >
        {Array.from({ length: SEGMENTS }, (_, index) => (
          <span
            key={index}
            className={cn(
              "h-2.5 flex-1 rounded-[2px] transition-colors duration-500",
              index < filled
                ? tinted
                  ? "bg-[rgb(var(--type-rgb))]"
                  : "bg-ink"
                : "bg-ink/[0.08] dark:bg-ink/[0.12]",
            )}
            style={{ transitionDelay: `${index * 12}ms` }}
          />
        ))}
      </span>
      <span className="text-right font-mono text-sm font-medium tabular-nums">{value}</span>
    </div>
  );
}

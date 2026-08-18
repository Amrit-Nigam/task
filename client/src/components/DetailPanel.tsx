import { Heart, Ruler, Sparkles, Weight, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { StatMeter } from "@/components/StatMeter";
import { TypeChip } from "@/components/TypeChip";
import { ErrorState } from "@/components/ErrorState";
import { Button } from "@/components/ui/button";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  formatDexNumber,
  formatHeight,
  formatName,
  formatWeight,
  humanise,
} from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";
import { STAT_LABELS, type StatKey } from "@/types/pokemon";

const STAT_ORDER: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

interface DetailPanelProps {
  name: string;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (name: string) => void;
}

/**
 * The full record for one Pokémon: a right-hand drawer on desktop, a bottom
 * sheet on small screens. Escape closes it and focus returns to the page.
 */
export function DetailPanel({ name, onClose, isFavorite, onToggleFavorite }: DetailPanelProps) {
  const { detail, status, error, retry } = usePokemonDetail(name);
  const isCompact = useMediaQuery("(max-width: 767px)");
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes, and the page behind must not scroll while the panel is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex md:justify-end">
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={detail ? formatName(detail.name) : "Pokémon details"}
        tabIndex={-1}
        style={detail ? typeVars(detail.types) : undefined}
        className={cn(
          "relative z-10 flex w-full flex-col overflow-y-auto bg-surface shadow-panel outline-none",
          isCompact
            ? "mt-16 animate-sheet-in rounded-t-[26px]"
            : "max-w-[540px] animate-drawer-in border-l-[3px] border-[var(--pd-black)]",
        )}
      >
        <PanelHeader
          onClose={onClose}
          isFavorite={isFavorite}
          onToggleFavorite={() => detail && onToggleFavorite(detail.name)}
          canFavorite={Boolean(detail)}
        />

        {status === "loading" ? <DetailSkeleton /> : null}

        {status === "error" && error ? (
          <div className="p-5">
            <ErrorState
              title={error.isNotFound ? "Pokémon not found." : "Something went wrong."}
              message={
                error.isNotFound
                  ? "Try searching for another Pokémon."
                  : error.message
              }
              onRetry={error.isNotFound ? undefined : retry}
            />
          </div>
        ) : null}

        {status === "ready" && detail ? (
          <>
            <div className="halo relative grid place-items-center px-6 pb-2 pt-4">
              <span className="readout absolute left-6 top-4 text-[11px]">
                {formatDexNumber(detail.id)}
              </span>
              {detail.sprite ? (
                <img
                  src={detail.sprite}
                  alt={formatName(detail.name)}
                  width={260}
                  height={260}
                  className="h-52 w-52 object-contain drop-shadow-[0_18px_28px_rgb(var(--type-rgb)/0.4)] sm:h-60 sm:w-60"
                />
              ) : null}
            </div>

            <div className="space-y-7 px-6 pb-10">
              <header className="space-y-3">
                <h2 className="font-display text-[2rem] font-bold leading-none tracking-tight">
                  {formatName(detail.name)}
                </h2>
                {detail.genus ? (
                  <p className="readout text-[11px]">{detail.genus}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {detail.types.map((type) => (
                    <TypeChip key={type} type={type} size="md" />
                  ))}
                </div>
              </header>

              {detail.description ? (
                <p className="text-[15px] leading-relaxed text-muted">{detail.description}</p>
              ) : null}

              <dl className="grid grid-cols-3 gap-3">
                <Measure icon={<Ruler className="h-4 w-4" />} label="Height" value={formatHeight(detail.height)} />
                <Measure icon={<Weight className="h-4 w-4" />} label="Weight" value={formatWeight(detail.weight)} />
                <Measure
                  icon={<Sparkles className="h-4 w-4" />}
                  label="Base exp"
                  value={detail.baseExperience === null ? "—" : String(detail.baseExperience)}
                />
              </dl>

              <Section title="Base stats">
                <div className="space-y-2.5">
                  {STAT_ORDER.map((key) => (
                    <StatMeter key={key} label={STAT_LABELS[key]} value={detail.stats[key]} />
                  ))}
                  <div className="flex items-center justify-between border-t-2 border-[var(--pd-black)] pt-3">
                    <span className="readout">Total</span>
                    <span className="font-mono text-sm font-medium tabular-nums">
                      {STAT_ORDER.reduce((sum, key) => sum + detail.stats[key], 0)}
                    </span>
                  </div>
                </div>
              </Section>

              <Section title="Abilities">
                <ul className="flex flex-wrap gap-2">
                  {detail.abilities.map((ability) => (
                    <li
                      key={ability.name}
                      className="flex items-center gap-2 rounded-full border border-edge bg-raised px-3.5 py-1.5 text-sm"
                    >
                      {humanise(ability.name)}
                      {ability.isHidden ? (
                        <span className="readout text-[9px]">Hidden</span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </Section>

              <Section title={`Moves · ${detail.moveCount} total`}>
                {detail.moves.length > 0 ? (
                  <ul className="divide-y divide-edge overflow-hidden rounded-xl border border-edge">
                    {detail.moves.map((move) => (
                      <li
                        key={move.name}
                        className="flex items-center justify-between bg-raised px-4 py-2.5 text-sm"
                      >
                        <span>{humanise(move.name)}</span>
                        <span className="readout">
                          {move.learnedAtLevel > 0 ? `Lv ${move.learnedAtLevel}` : "Start"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted">
                    This Pokémon learns no moves by levelling up.
                  </p>
                )}
                <p className="mt-3 text-xs text-muted">
                  Showing the first {detail.moves.length} level-up moves.
                </p>
              </Section>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function PanelHeader({
  onClose,
  isFavorite,
  onToggleFavorite,
  canFavorite,
}: {
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  canFavorite: boolean;
}) {
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between border-b border-edge bg-surface/85 px-4 py-3 backdrop-blur">
      <span className="readout">Specimen record</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleFavorite}
          disabled={!canFavorite}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          className={cn(isFavorite && "text-signal hover:text-signal")}
        >
          <Heart className={cn("h-[18px] w-[18px]", isFavorite && "fill-current")} />
        </Button>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close details">
          <X className="h-[18px] w-[18px]" />
        </Button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="readout">{title}</h3>
      {children}
    </section>
  );
}

function Measure({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-edge bg-raised px-3 py-3">
      <dt className="readout flex items-center gap-1.5">
        <span className="text-muted">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-base font-medium tabular-nums">{value}</dd>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-7 p-6">
      <div className="skeleton mx-auto h-52 w-52 rounded-full" />
      <div className="space-y-3">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-3 w-32 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-7 w-24 rounded-full" />
          <div className="skeleton h-7 w-20 rounded-full" />
        </div>
      </div>
      <div className="skeleton h-16 w-full rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        <div className="skeleton h-[68px] rounded-xl" />
        <div className="skeleton h-[68px] rounded-xl" />
        <div className="skeleton h-[68px] rounded-xl" />
      </div>
      <div className="space-y-2.5">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="skeleton h-6 w-full rounded" />
        ))}
      </div>
    </div>
  );
}

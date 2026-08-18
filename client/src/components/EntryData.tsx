import { Ruler, Sparkles, Weight } from "lucide-react";
import type { ReactNode } from "react";
import { ErrorState } from "@/components/ErrorState";
import { StatMeter } from "@/components/StatMeter";
import { TypeChip } from "@/components/TypeChip";
import { formatHeight, formatName, formatWeight, humanise } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { STAT_LABELS, type PokemonDetail, type StatKey } from "@/types/pokemon";
import type { PokedexApiError } from "@/services/pokemonApi";

const STAT_ORDER: StatKey[] = [
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
];

interface EntryDataProps {
  detail: PokemonDetail | null;
  status: "loading" | "ready" | "error";
  error: PokedexApiError | null;
  onRetry: () => void;
}

/**
 * The written half of a Pokédex entry — everything except the artwork, which
 * the device shows on its own screen.
 *
 * Split out of the detail drawer so the two-panel desktop layout and the
 * mobile sheet render the identical record: on desktop this fills the right
 * half of the device, on mobile it sits under the sprite in the sheet.
 */
export function EntryData({ detail, status, error, onRetry }: EntryDataProps) {
  if (status === "loading") return <EntrySkeleton />;

  if (status === "error" && error) {
    return (
      <ErrorState
        title={error.isNotFound ? "Pokémon not found." : "Something went wrong."}
        message={error.isNotFound ? "Try searching for another Pokémon." : error.message}
        onRetry={error.isNotFound ? undefined : onRetry}
      />
    );
  }

  if (!detail) return null;

  return (
    /* The record carries its own type vars: it is rendered detached from the
       card and the viewer, so without these the stat meters lose their tint
       and fall back to an untinted grey. */
    <div className="space-y-6 sm:space-y-7" style={typeVars(detail.types)}>
      <header className="space-y-3">
        <h2 className="font-display text-[1.65rem] font-bold leading-none tracking-tight sm:text-[2rem]">
          {formatName(detail.name)}
        </h2>
        {detail.genus ? <p className="readout text-[11px]">{detail.genus}</p> : null}
        <div className="flex flex-wrap gap-2">
          {detail.types.map((type) => (
            <TypeChip key={type} type={type} size="md" />
          ))}
        </div>
      </header>

      {detail.description ? (
        <p className="text-[15px] leading-relaxed text-muted">{detail.description}</p>
      ) : null}

      <dl className="grid grid-cols-3 gap-2 sm:gap-3">
        <Measure
          icon={<Ruler className="h-4 w-4" />}
          label="Height"
          value={formatHeight(detail.height)}
        />
        <Measure
          icon={<Weight className="h-4 w-4" />}
          label="Weight"
          value={formatWeight(detail.weight)}
        />
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
              className="flex items-center gap-2 rounded-full border-2 border-[var(--pd-black)] bg-raised px-3.5 py-1.5 text-sm"
            >
              {humanise(ability.name)}
              {ability.isHidden ? <span className="readout text-[9px]">Hidden</span> : null}
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Moves · ${detail.moveCount} total`}>
        {detail.moves.length > 0 ? (
          <ul className="divide-y-2 divide-[var(--pd-black)] overflow-hidden rounded-xl border-2 border-[var(--pd-black)]">
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
          <p className="text-sm text-muted">This Pokémon learns no moves by levelling up.</p>
        )}
        <p className="mt-3 text-xs text-muted">
          Showing the first {detail.moves.length} level-up moves.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
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
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="slot px-3 py-3">
      <dt className="readout flex items-center gap-1.5">
        <span className="text-muted">{icon}</span>
        {label}
      </dt>
      <dd className="mt-1.5 font-mono text-base font-medium tabular-nums">{value}</dd>
    </div>
  );
}

export function EntrySkeleton() {
  return (
    /* Mirrors the record's own structure section for section, at the same
       `space-y` the real one uses — a skeleton that only approximates the
       shape it replaces just moves the jump from load time to swap time. */
    <div className="space-y-6 sm:space-y-7">
      <header className="space-y-3">
        {/* 32px / 38px: the rendered heights of the name at its two sizes. */}
        <div className="skeleton h-8 w-52 rounded sm:h-[38px]" />
        <div className="skeleton h-3 w-32 rounded" />
        <div className="flex gap-2">
          <div className="skeleton h-[30px] w-24 rounded-full" />
          <div className="skeleton h-[30px] w-20 rounded-full" />
        </div>
      </header>

      {/* Two lines of flavour text, ragged like the real thing. */}
      <div className="space-y-2">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-4/5 rounded" />
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="skeleton h-[74px] rounded-[10px]" />
        <div className="skeleton h-[74px] rounded-[10px]" />
        <div className="skeleton h-[74px] rounded-[10px]" />
      </div>

      <SkeletonSection labelWidth="w-20">
        <div className="space-y-2.5">
          {Array.from({ length: 6 }, (_, index) => (
            /* The stat row's own three-column geometry, so the meters do not
               slide sideways as they come in. */
            <div
              key={index}
              className="grid grid-cols-[3.75rem_1fr_2.25rem] items-center gap-3"
            >
              <div className="skeleton h-2.5 rounded" />
              <div className="skeleton h-2.5 rounded" />
              <div className="skeleton h-3 rounded" />
            </div>
          ))}
          <div className="flex items-center justify-between border-t-2 border-[var(--pd-black)] pt-3">
            <div className="skeleton h-2.5 w-10 rounded" />
            <div className="skeleton h-3.5 w-8 rounded" />
          </div>
        </div>
      </SkeletonSection>

      <SkeletonSection labelWidth="w-16">
        <div className="flex flex-wrap gap-2">
          <div className="skeleton h-[34px] w-28 rounded-full" />
          <div className="skeleton h-[34px] w-24 rounded-full" />
        </div>
      </SkeletonSection>

      <SkeletonSection labelWidth="w-28">
        <div className="divide-y-2 divide-[var(--pd-black)] overflow-hidden rounded-xl border-2 border-[var(--pd-black)]">
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="flex items-center justify-between bg-raised px-4 py-3">
              <div className="skeleton h-3.5 w-32 rounded" />
              <div className="skeleton h-2.5 w-10 rounded" />
            </div>
          ))}
        </div>
      </SkeletonSection>
    </div>
  );
}

/** A section heading and its body, at `Section`'s spacing. */
function SkeletonSection({
  labelWidth,
  children,
}: {
  labelWidth: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className={`skeleton h-2.5 rounded ${labelWidth}`} />
      {children}
    </section>
  );
}

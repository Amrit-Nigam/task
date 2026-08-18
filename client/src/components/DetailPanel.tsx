import { Heart, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { BallLoader } from "@/components/BallLoader";
import { EntryData } from "@/components/EntryData";
import { Button } from "@/components/ui/button";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { formatDexNumber, formatName } from "@/lib/format";
import { typeVars } from "@/lib/types-theme";
import { cn } from "@/lib/utils";

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
          "relative z-10 flex w-full flex-col overflow-y-auto overscroll-contain bg-surface shadow-panel outline-none",
          isCompact
            ? "mt-10 animate-sheet-in rounded-t-[26px] sm:mt-16"
            : "max-w-[540px] animate-drawer-in border-l-[3px] border-[var(--pd-black)]",
        )}
      >
        <PanelHeader
          onClose={onClose}
          isFavorite={isFavorite}
          onToggleFavorite={() => detail && onToggleFavorite(detail.name)}
          canFavorite={Boolean(detail)}
        />

        <div className="halo relative grid place-items-center px-4 pb-2 pt-4 sm:px-6">
          {detail ? (
            <>
              <span className="readout absolute left-4 top-4 text-[11px] sm:left-6">
                {formatDexNumber(detail.id)}
              </span>
              {detail.sprite ? (
                <img
                  src={detail.sprite}
                  alt={formatName(detail.name)}
                  width={260}
                  height={260}
                  className="h-40 w-40 object-contain drop-shadow-[0_18px_28px_rgb(var(--type-rgb)/0.4)] sm:h-56 sm:w-56 md:h-60 md:w-60"
                />
              ) : null}
            </>
          ) : (
            <div className="grid h-40 w-40 place-items-center sm:h-56 sm:w-56 md:h-60 md:w-60">
              <BallLoader className="h-24 w-24 sm:h-28 sm:w-28" />
            </div>
          )}
        </div>

        <div className="px-4 pb-10 sm:px-6">
          <EntryData
            detail={detail}
            status={status}
            error={error}
            onRetry={retry}
          />
        </div>
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


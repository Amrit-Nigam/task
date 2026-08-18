import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS, type SortKey, type SortOrder } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface SortControlProps {
  sort: SortKey;
  order: SortOrder;
  onSortChange: (sort: SortKey) => void;
  onOrderChange: (order: SortOrder) => void;
  /** Drop the "Sort" label. The open device's half cannot carry it and a
      readable search field at the same time. */
  compact?: boolean;
  className?: string;
}

export function SortControl({
  sort,
  order,
  onSortChange,
  onOrderChange,
  compact = false,
  className,
}: SortControlProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label
        className={cn(
          "slot relative flex h-12 items-center gap-2 pr-3 focus-within:ring-2 focus-within:ring-white/60",
          compact ? "pl-3" : "pl-4",
        )}
      >
        <span className={cn("readout", compact && "sr-only")}>Sort</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          aria-label="Sort Pokémon by"
          className="w-full min-w-0 self-stretch cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      {/* Styled as a key off the device's blue pad — the one control here that
          is a toggle rather than a field, so it reads as hardware. */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onOrderChange(order === "asc" ? "desc" : "asc")}
        aria-label={order === "asc" ? "Sort descending" : "Sort ascending"}
        title={order === "asc" ? "Ascending" : "Descending"}
        className="key h-12 w-12 shrink-0 rounded-[10px] border-[3px] hover:brightness-110"
      >
        {order === "asc" ? (
          <ArrowUpNarrowWide className="h-4 w-4" />
        ) : (
          <ArrowDownWideNarrow className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

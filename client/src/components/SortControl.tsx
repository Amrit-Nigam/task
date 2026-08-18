import { ArrowDownWideNarrow, ArrowUpNarrowWide } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SORT_OPTIONS, type SortKey, type SortOrder } from "@/types/pokemon";
import { cn } from "@/lib/utils";

interface SortControlProps {
  sort: SortKey;
  order: SortOrder;
  onSortChange: (sort: SortKey) => void;
  onOrderChange: (order: SortOrder) => void;
  className?: string;
}

export function SortControl({
  sort,
  order,
  onSortChange,
  onOrderChange,
  className,
}: SortControlProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="slot relative flex h-12 items-center gap-2 pl-4 pr-3 focus-within:ring-2 focus-within:ring-white/60">
        <span className="readout">Sort</span>
        <select
          value={sort}
          onChange={(event) => onSortChange(event.target.value as SortKey)}
          aria-label="Sort Pokémon by"
          className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium outline-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <Button
        variant="outline"
        size="icon"
        onClick={() => onOrderChange(order === "asc" ? "desc" : "asc")}
        aria-label={order === "asc" ? "Sort descending" : "Sort ascending"}
        title={order === "asc" ? "Ascending" : "Descending"}
        className="h-12 w-12"
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

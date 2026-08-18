import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  query: string;
  type: string | null;
  onClear: () => void;
}

/** Shown when a search or filter matches nothing. */
export function EmptyState({ query, type, onClear }: EmptyStateProps) {
  const description = query
    ? `Nothing in the Pokédex matches "${query}"${type ? ` in ${type} type` : ""}.`
    : "No Pokémon match this filter.";

  return (
    <div className="panel mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-full bg-ink/[0.06] text-muted">
        <SearchX className="h-6 w-6" />
      </span>
      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-bold">No Pokémon found.</h2>
        <p className="mx-auto max-w-sm text-sm text-muted">{description}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onClear}>
        Clear filters
      </Button>
    </div>
  );
}

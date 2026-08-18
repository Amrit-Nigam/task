import { Loader2 } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CompareDialog } from "@/components/CompareDialog";
import { DeviceShell } from "@/components/DeviceShell";
import { CompareTray } from "@/components/CompareTray";
import { DetailPanel } from "@/components/DetailPanel";
import { EmptyState } from "@/components/EmptyState";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { PokemonGrid } from "@/components/PokemonGrid";
import { SearchBar } from "@/components/SearchBar";
import { SortControl } from "@/components/SortControl";
import { TypeFilter } from "@/components/TypeFilter";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFavoritePokemon } from "@/hooks/useFavoritePokemon";
import { useFavorites } from "@/hooks/useFavorites";
import { usePokemonList } from "@/hooks/usePokemonList";
import { useTheme } from "@/hooks/useTheme";
import { useTypes } from "@/hooks/useTypes";
import type { ListQuery, PokemonSummary, SortKey, SortOrder } from "@/types/pokemon";

const STAT_SORTS: SortKey[] = ["hp", "attack", "defense", "speed"];

export function ExplorerPage() {
  const navigate = useNavigate();
  const { name: selectedName } = useParams<{ name: string }>();

  const { theme, toggleTheme } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { types, total: dexTotal } = useTypes();

  const [searchInput, setSearchInput] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("id");
  const [order, setOrder] = useState<SortOrder>("asc");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [compareSelection, setCompareSelection] = useState<PokemonSummary[]>([]);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  const search = useDebouncedValue(searchInput);
  const query = useMemo<ListQuery>(
    () => ({ type: selectedType, search, sort, order }),
    [selectedType, search, sort, order],
  );

  const list = usePokemonList(query);
  const favoriteNames = useMemo(() => [...favorites], [favorites]);
  const favoriteList = useFavoritePokemon(favoriteNames, showFavoritesOnly);

  // The favourites view filters and sorts in the browser: the set is small and
  // already loaded, so a round trip would only add latency.
  const favoriteResults = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const filtered = favoriteList.items.filter(
      (pokemon) =>
        (!needle || pokemon.name.includes(needle)) &&
        (!selectedType || pokemon.types.includes(selectedType)),
    );

    const sorted = [...filtered].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "id") return a.id - b.id;
      return b.stats[sort] - a.stats[sort];
    });

    const naturallyAscending = sort === "id" || sort === "name";
    return order === "asc" && !naturallyAscending
      ? sorted.reverse()
      : order === "desc" && naturallyAscending
        ? sorted.reverse()
        : sorted;
  }, [favoriteList.items, search, selectedType, sort, order]);

  const results = showFavoritesOnly ? favoriteResults : list.items;
  const isInitialLoading = showFavoritesOnly ? favoriteList.isLoading : list.status === "loading";
  const isEmpty = !isInitialLoading && results.length === 0;

  const toggleCompare = useCallback((pokemon: PokemonSummary) => {
    setCompareSelection((current) => {
      const without = current.filter((entry) => entry.name !== pokemon.name);
      if (without.length !== current.length) return without;
      // Keep the two most recent picks.
      return [...current, pokemon].slice(-2);
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSelectedType(null);
    setShowFavoritesOnly(false);
  }, []);

  const comparePair =
    compareSelection.length === 2
      ? ([compareSelection[0], compareSelection[1]] as [PokemonSummary, PokemonSummary])
      : null;

  const statusLine = isInitialLoading
    ? "Loading"
    : showFavoritesOnly
      ? `${results.length} favorite${results.length === 1 ? "" : "s"}`
      : `${list.total} result${list.total === 1 ? "" : "s"}`;

  return (
    <div className="min-h-dvh pb-28">
      <DeviceShell
        status={
          <>
            {statusLine}
            {selectedType ? ` · ${selectedType}` : ""}
            {!showFavoritesOnly && list.total > 0 ? ` · ${list.total} indexed` : ""}
          </>
        }
        actions={
          <Header
            theme={theme}
            onToggleTheme={toggleTheme}
            favoritesCount={favorites.size}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavoritesOnly={() => setShowFavoritesOnly((current) => !current)}
          />
        }
        controls={
          <div className="space-y-3">
            <div className="flex flex-col gap-3 md:flex-row">
              <SearchBar value={searchInput} onChange={setSearchInput} />
              <SortControl
                sort={sort}
                order={order}
                onSortChange={setSort}
                onOrderChange={setOrder}
                className="shrink-0"
              />
            </div>

            <TypeFilter
              types={types}
              selected={selectedType}
              onSelect={setSelectedType}
              totalCount={dexTotal}
            />
          </div>
        }
      >
        {list.indexing && STAT_SORTS.includes(sort) && !showFavoritesOnly ? (
          <p className="mb-4 flex items-center gap-2 text-xs text-muted">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Building the stat index — ordering will settle shortly.
          </p>
        ) : null}

        {list.status === "error" && list.error && !showFavoritesOnly ? (
          <ErrorState message={list.error.message} onRetry={list.retry} />
        ) : isEmpty ? (
          showFavoritesOnly && favorites.size === 0 ? (
            <EmptyStateFavorites onBrowse={() => setShowFavoritesOnly(false)} />
          ) : (
            <EmptyState query={searchInput} type={selectedType} onClear={clearFilters} />
          )
        ) : (
          <PokemonGrid
            pokemon={results}
            isLoading={isInitialLoading || list.status === "loading-more"}
            skeletonCount={list.pageSize / 2}
            isFavorite={isFavorite}
            onToggleFavorite={toggleFavorite}
            isSelectedForCompare={(name) =>
              compareSelection.some((entry) => entry.name === name)
            }
            onToggleCompare={toggleCompare}
          />
        )}

        {!showFavoritesOnly && list.hasMore && list.status !== "error" ? (
          <div className="mt-10 flex flex-col items-center gap-2">
            <Button
              variant="solid"
              onClick={list.loadMore}
              disabled={list.status === "loading-more"}
            >
              {list.status === "loading-more" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                "Load more"
              )}
            </Button>
            <p className="readout">
              {results.length} of {list.total}
            </p>
          </div>
        ) : null}
      </DeviceShell>

      <CompareTray
        selection={compareSelection}
        onRemove={(name) =>
          setCompareSelection((current) => current.filter((entry) => entry.name !== name))
        }
        onClear={() => setCompareSelection([])}
        onCompare={() => setIsCompareOpen(true)}
      />

      {isCompareOpen && comparePair ? (
        <CompareDialog pair={comparePair} onClose={() => setIsCompareOpen(false)} />
      ) : null}

      {selectedName ? (
        <DetailPanel
          name={selectedName}
          onClose={() => navigate("/", { replace: false })}
          isFavorite={isFavorite(selectedName)}
          onToggleFavorite={toggleFavorite}
        />
      ) : null}
    </div>
  );
}

function EmptyStateFavorites({ onBrowse }: { onBrowse: () => void }) {
  return (
    <div className="panel flex flex-col items-center gap-4 px-6 py-16 text-center">
      <span className="text-3xl" aria-hidden>
        ♡
      </span>
      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-bold">No favorites yet.</h2>
        <p className="mx-auto max-w-sm text-sm text-muted">
          Tap the heart on any Pokémon to keep it here. Favorites stay on this device.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={onBrowse}>
        Browse the Pokédex
      </Button>
    </div>
  );
}

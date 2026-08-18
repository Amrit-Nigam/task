import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BallLoader } from "@/components/BallLoader";
import { CompareDialog } from "@/components/CompareDialog";
import { CompareTray } from "@/components/CompareTray";
import { DetailPanel } from "@/components/DetailPanel";
import { DeviceShell } from "@/components/DeviceShell";
import { EmptyState } from "@/components/EmptyState";
import { EntryData } from "@/components/EntryData";
import { ErrorState } from "@/components/ErrorState";
import { Header } from "@/components/Header";
import { HingeSpine } from "@/components/HingeSpine";
import { IndexList } from "@/components/IndexList";
import { PokemonGrid } from "@/components/PokemonGrid";
import { SearchBar } from "@/components/SearchBar";
import { SortControl } from "@/components/SortControl";
import { SpecimenViewer } from "@/components/SpecimenViewer";
import { TypeFilter } from "@/components/TypeFilter";
import { Button } from "@/components/ui/button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useFavoritePokemon } from "@/hooks/useFavoritePokemon";
import { useFavorites } from "@/hooks/useFavorites";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { usePokemonDetail } from "@/hooks/usePokemonDetail";
import { usePokemonList } from "@/hooks/usePokemonList";
import { useTheme } from "@/hooks/useTheme";
import { useTypes } from "@/hooks/useTypes";
import { formatDexNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ListQuery, PokemonSummary, SortKey, SortOrder } from "@/types/pokemon";

const STAT_SORTS: SortKey[] = ["hp", "attack", "defense", "speed"];

export function ExplorerPage() {
  const navigate = useNavigate();
  const { name: selectedName } = useParams<{ name: string }>();

  const { theme, toggleTheme } = useTheme();
  const { favorites, isFavorite, toggleFavorite } = useFavorites();
  const { types, total: dexTotal } = useTypes();

  // Below this width the device cannot be opened side by side, so the index
  // becomes a full-width list and the record returns to a bottom sheet.
  const isCompact = useMediaQuery("(max-width: 1023px)");

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

  // On the open device something is always on the screen: the URL's pick if
  // there is one, otherwise the first row of the current result set. The
  // fallback is display-only — it never rewrites the URL, so a shared link
  // still means exactly what it says and the back button stays honest.
  const viewedName = selectedName ?? (isCompact ? null : (results[0]?.name ?? null));
  const viewed = usePokemonDetail(viewedName);

  /* The D-pad walks the result set the list is already showing, so stepping
     always agrees with what is on screen — filtered, sorted, favourites-only
     and all. Clamped rather than wrapped: running off the end of 1,025 back to
     the start is disorienting when the set is this long. */
  const viewedIndex = results.findIndex((entry) => entry.name === viewedName);
  const step = useCallback(
    (delta: number) => {
      if (viewedIndex < 0) return;
      const next = results[viewedIndex + delta];
      if (next) navigate(`/pokemon/${next.name}`);
    },
    [results, viewedIndex, navigate],
  );

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

  const controls = (
    <div className="shrink-0 space-y-3">
      <div
        className={cn(
          "flex gap-2 sm:gap-3",
          /* Stacked only on a phone. In the open device's narrow half the two
             stay on one row and the search field shortens its placeholder
             instead — a stacked pair costs the index list ~45px, and on a
             768px-high screen the index has none to give. */
          isCompact ? "flex-col sm:flex-row" : "flex-row",
        )}
      >
        {/* Open, the search sits in the device's 380px half; closed, it has the
            full width of the phone. */}
        <SearchBar value={searchInput} onChange={setSearchInput} narrow={!isCompact} />
        <SortControl
          sort={sort}
          order={order}
          onSortChange={setSort}
          onOrderChange={setOrder}
          /* In the open device's 340px half the label would leave the search
             field too short to read its own placeholder, so it is dropped
             until the half is wide enough to carry both. */
          compact={!isCompact}
          className="shrink-0"
        />
      </div>
      <TypeFilter
        types={types}
        selected={selectedType}
        onSelect={setSelectedType}
        totalCount={dexTotal}
        rail={!isCompact}
      />
    </div>
  );

  const isSelectedForCompare = (name: string) =>
    compareSelection.some((entry) => entry.name === name);
  const hasMore = !showFavoritesOnly && list.hasMore && list.status !== "error";

  /* Shown in place of the index when there is nothing to list. */
  const notice =
    isEmpty ? (
      <div className="screen shrink-0 p-5">
        {showFavoritesOnly && favorites.size === 0 ? (
          <EmptyStateFavorites onBrowse={() => setShowFavoritesOnly(false)} />
        ) : (
          <EmptyState query={searchInput} type={selectedType} onClear={clearFilters} />
        )}
      </div>
    ) : list.status === "error" && list.error && !showFavoritesOnly ? (
      <div className="screen shrink-0 p-5">
        <ErrorState message={list.error.message} onRetry={list.retry} />
      </div>
    ) : null;

  /* The open device lists rows — at 380px a card grid would fit two across and
     turn the left half into artwork, which is the viewer's job. Closed, there
     is no viewer to compete with, so the phone keeps the card grid. */
  const indexPane =
    notice ?? (
      <IndexList
        pokemon={results}
        activeName={viewedName}
        isLoading={isInitialLoading}
        isFavorite={isFavorite}
        onToggleFavorite={toggleFavorite}
        isSelectedForCompare={isSelectedForCompare}
        onToggleCompare={toggleCompare}
        hasMore={hasMore}
        isLoadingMore={list.status === "loading-more"}
        onLoadMore={list.loadMore}
        total={list.total}
      />
    );

  return (
    <div className={cn("min-h-dvh", compareSelection.length > 0 ? "pb-28" : "pb-6")}>
      <DeviceShell
        status={
          <>
            {statusLine}
            {selectedType ? ` · ${selectedType}` : ""}
            {showFavoritesOnly ? " · favorites" : ""}
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
      >
        {isCompact ? (
          /* Closed: one column. The record opens as a sheet over it. */
          <div className="space-y-3">
            {controls}
            {notice ?? (
              <div className="screen p-2 sm:p-3">
                <PokemonGrid
                  pokemon={results}
                  isLoading={isInitialLoading || list.status === "loading-more"}
                  skeletonCount={list.pageSize / 2}
                  isFavorite={isFavorite}
                  onToggleFavorite={toggleFavorite}
                  isSelectedForCompare={isSelectedForCompare}
                  onToggleCompare={toggleCompare}
                />

                {hasMore ? (
                  <div className="mt-8 flex flex-col items-center gap-2">
                    <Button
                      variant="solid"
                      onClick={list.loadMore}
                      disabled={list.status === "loading-more"}
                    >
                      {list.status === "loading-more" ? (
                        <>
                          <BallLoader variant="spin" className="h-4 w-4" />
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
              </div>
            )}
          </div>
        ) : (
          /* Open: the two halves, hinged down the middle. Each scrolls in its
             own right, so reading the record never scrolls the index away. */
          <div className="flex items-stretch gap-2">
            <div className="flex h-[calc(100dvh-13.5rem)] min-h-[26rem] w-[340px] shrink-0 flex-col gap-3 xl:w-[440px] 2xl:w-[480px]">
              <SpecimenViewer
                detail={viewed.detail}
                isLoading={viewed.status === "loading" && Boolean(viewedName)}
                isFavorite={viewed.detail ? isFavorite(viewed.detail.name) : false}
                onToggleFavorite={toggleFavorite}
                onStep={step}
                canStepBack={viewedIndex > 0}
                canStepForward={viewedIndex >= 0 && viewedIndex < results.length - 1}
              />
              {controls}
              {indexPane}
            </div>

            <HingeSpine />

            <div className="screen h-[calc(100dvh-13.5rem)] min-h-[26rem] min-w-0 flex-1 overflow-y-auto overscroll-contain p-4 lg:p-5 xl:p-7">
              {list.indexing && STAT_SORTS.includes(sort) && !showFavoritesOnly ? (
                <p className="mb-5 flex items-center gap-2 text-xs text-muted">
                  <BallLoader variant="spin" className="h-3.5 w-3.5" />
                  Building the stat index — ordering will settle shortly.
                </p>
              ) : null}

              {/* The record's own black strip, as across the top of the
                  device's right half. It names what the panel is showing so the
                  half stands on its own when the viewer is scrolled past. */}
              <div className="display mb-5 flex items-center justify-between gap-3 px-3 py-2">
                <span className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                  Specimen record
                </span>
                <span className="font-mono text-[11px] font-bold tabular-nums">
                  {viewed.detail ? formatDexNumber(viewed.detail.id) : "————"}
                </span>
              </div>

              {viewedName ? (
                <EntryData
                  detail={viewed.detail}
                  status={viewed.status}
                  error={viewed.error}
                  onRetry={viewed.retry}
                />
              ) : (
                <p className="readout">No specimen selected</p>
              )}
            </div>
          </div>
        )}
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

      {/* Only while the device is closed. Opened, the record is already on the
          right half — putting a sheet over it would cover the thing it shows. */}
      {isCompact && selectedName ? (
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
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
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

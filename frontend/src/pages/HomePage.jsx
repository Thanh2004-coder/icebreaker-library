import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Filters from "../components/Filters.jsx";
import GameCard from "../components/GameCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SoftStatusBanner from "../components/SoftStatusBanner.jsx";
import { filterGames, paginateGames } from "../cache/filterGames.js";
import {
  getCachedFilters,
  getStaticCatalog,
  pageSize,
  softRefreshCatalogRatings,
  wakeBackendEarly,
} from "../cache/gameStore.js";

const EMPTY_FILTERS = {
  players: "",
  context: "",
  purposes: [],
  duration: "",
};

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  // Instant catalogue — bundled static data, never blocked on /api/games
  const [catalog, setCatalog] = useState(() => getStaticCatalog());
  const [filters] = useState(() => getCachedFilters());
  const [ratingsLive, setRatingsLive] = useState(false);
  const [softRefreshing, setSoftRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Background only: wake + optional rating refresh. UI already has 20 games.
  useEffect(() => {
    let cancelled = false;
    wakeBackendEarly();
    setSoftRefreshing(true);
    softRefreshCatalogRatings()
      .then((games) => {
        if (cancelled) return;
        setCatalog(games);
        setRatingsLive(true);
        setSoftRefreshing(false);
      })
      .catch(() => {
        if (!cancelled) setSoftRefreshing(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => filterGames(catalog || [], { search, selected, filterCatalog: filters }),
    [catalog, search, selected, filters]
  );

  const result = useMemo(
    () => paginateGames(filtered, page, pageSize()),
    [filtered, page]
  );

  useEffect(() => {
    if (page > 0 && page >= result.totalPages && result.totalPages > 0) {
      setPage(result.totalPages - 1);
    }
  }, [page, result.totalPages]);

  const onFilterChange = (next) => {
    setSelected(next);
    setPage(0);
  };

  const showSoftBanner = softRefreshing && !ratingsLive;

  return (
    <div className="page">
      <Header />
      <main className="layout">
        <form className="search-wrap" onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="search">Tìm kiếm trò chơi</label>
          <input
            id="search"
            type="search"
            placeholder="Tìm kiếm trò chơi..."
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
          />
        </form>

        <Filters filters={filters} selected={selected} onChange={onFilterChange} />

        <div className="result-bar">
          <p>Tìm thấy {result.totalElements} trò chơi</p>
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setSelected(EMPTY_FILTERS);
              setPage(0);
            }}
          >
            Xóa bộ lọc
          </button>
        </div>

        <SoftStatusBanner show={showSoftBanner} />

        <section className="grid">
          {result.content.length === 0 ? (
            <p className="empty">Không có trò chơi khớp. Thử nới bộ lọc hoặc xóa từ khóa.</p>
          ) : null}
          {result.content.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>

        <Pagination page={result.page} totalPages={result.totalPages} onPageChange={setPage} />
      </main>
    </div>
  );
}

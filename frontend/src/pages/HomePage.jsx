import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Filters from "../components/Filters.jsx";
import GameCard from "../components/GameCard.jsx";
import Pagination from "../components/Pagination.jsx";
import SoftStatusBanner from "../components/SoftStatusBanner.jsx";
import { filterGames, paginateGames } from "../cache/filterGames.js";
import {
  DEFAULT_FILTER_CATALOG,
  getMemoryCatalog,
  loadFilterCatalog,
  loadGameCatalog,
  mergeFilterCatalog,
  pageSize,
  readPersistedFilters,
  readPersistedGames,
  wakeBackendEarly,
} from "../cache/gameStore.js";

const EMPTY_FILTERS = {
  players: "",
  context: "",
  purposes: [],
  duration: "",
};

const SKELETON_MAX_MS = 3500;
const COLD_HINT_MS = 2500;

function initialCatalog() {
  return getMemoryCatalog() || readPersistedGames() || [];
}

function initialFilters() {
  return mergeFilterCatalog(readPersistedFilters() || DEFAULT_FILTER_CATALOG);
}

export default function HomePage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [catalog, setCatalog] = useState(initialCatalog);
  const [filters, setFilters] = useState(initialFilters);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const [fromCache, setFromCache] = useState(() => initialCatalog().length > 0);
  const [showColdHint, setShowColdHint] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(() => initialCatalog().length === 0);
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    const hasCache = (getMemoryCatalog() || readPersistedGames() || []).length > 0;

    setRefreshing(true);
    setError("");
    setFromCache(hasCache);
    setShowColdHint(false);
    setShowSkeleton(!hasCache);

    const coldTimer = setTimeout(() => {
      if (!cancelled) setShowColdHint(true);
    }, COLD_HINT_MS);

    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setShowSkeleton(false);
    }, SKELETON_MAX_MS);

    wakeBackendEarly();

    loadGameCatalog({ force: loadToken > 0 })
      .then((games) => {
        if (cancelled) return;
        setCatalog(games);
        setFromCache(false);
        setRefreshing(false);
        setShowColdHint(false);
        setShowSkeleton(false);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        const cached = getMemoryCatalog() || readPersistedGames() || [];
        if (cached.length) {
          setCatalog(cached);
          setFromCache(true);
          setError("");
        } else {
          setError(err.message || "Không tải được danh sách trò chơi.");
        }
        setRefreshing(false);
        setShowSkeleton(false);
      });

    loadFilterCatalog({ force: loadToken > 0 })
      .then((data) => {
        if (!cancelled) setFilters(mergeFilterCatalog(data));
      })
      .catch(() => {
        /* keep default / persisted filters */
      });

    return () => {
      cancelled = true;
      clearTimeout(coldTimer);
      clearTimeout(skeletonTimer);
    };
  }, [loadToken]);

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

  const onRetry = () => setLoadToken((n) => n + 1);

  const hasGames = result.content.length > 0;
  const emptyAfterLoad = !refreshing && !showSkeleton && !hasGames && !error;
  const showSoftBanner = (fromCache && hasGames) || (refreshing && hasGames);

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
          <p>
            {refreshing && !hasGames
              ? "Đang kết nối máy chủ…"
              : `Tìm thấy ${result.totalElements} trò chơi`}
          </p>
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

        {showColdHint && refreshing && !hasGames ? (
          <p className="cold-start-hint" role="status">
            Máy chủ đang khởi động. Bạn vẫn dùng được tìm kiếm và bộ lọc khi đã có dữ liệu lưu.
          </p>
        ) : null}

        {fromCache && !refreshing ? (
          <p className="cache-hint" role="status">
            <button type="button" className="text-btn inline" onClick={onRetry}>
              Tải lại từ máy chủ
            </button>
          </p>
        ) : null}

        {error ? (
          <div className="error-panel" role="alert">
            <p className="error">{error}</p>
            <button type="button" className="retry-btn" onClick={onRetry}>
              Thử lại
            </button>
          </div>
        ) : null}

        <section className="grid" aria-busy={refreshing && !hasGames}>
          {showSkeleton && !hasGames
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={`skeleton-${i}`} className="card skeleton-card" aria-hidden="true">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))
            : null}
          {emptyAfterLoad ? (
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

import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Filters from "../components/Filters.jsx";
import GameCard from "../components/GameCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { filterGames, paginateGames } from "../cache/filterGames.js";
import { loadFilterCatalog, loadGameCatalog, pageSize } from "../cache/gameStore.js";

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
  const [catalog, setCatalog] = useState(null);
  const [filters, setFilters] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [slowBackend, setSlowBackend] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSlowBackend(false);
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlowBackend(true);
    }, 4000);

    loadGameCatalog()
      .then((games) => {
        if (!cancelled) {
          setCatalog(games);
          setLoading(false);
          setSlowBackend(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setCatalog(null);
          setLoading(false);
          setSlowBackend(false);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    let cancelled = false;
    loadFilterCatalog()
      .then((data) => {
        if (!cancelled) setFilters(data);
      })
      .catch(() => {
        /* filter UI stays hidden until catalog arrives */
      });
    return () => {
      cancelled = true;
    };
  }, [loading]);

  const filtered = useMemo(
    () => filterGames(catalog || [], { search, selected, filterCatalog: filters }),
    [catalog, search, selected, filters]
  );

  const result = useMemo(
    () => paginateGames(filtered, page, pageSize()),
    [filtered, page]
  );

  // If filters catalog arrives late, context/purpose matching improves — keep page in range.
  useEffect(() => {
    if (page > 0 && page >= result.totalPages && result.totalPages > 0) {
      setPage(result.totalPages - 1);
    }
  }, [page, result.totalPages]);

  const onFilterChange = (next) => {
    setSelected(next);
    setPage(0);
  };

  const showSkeleton = loading && !catalog?.length;

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
            {loading
              ? slowBackend
                ? "Máy chủ đang khởi động (Render free)… thường 20–60 giây lần đầu sau khi ngủ."
                : "Đang tải…"
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

        {error ? <p className="error">{error} Hãy chắc Spring Boot đang chạy ở cổng 8080.</p> : null}

        {slowBackend && loading ? (
          <p className="cold-start-hint" role="status">
            Backend trên Render Free đang cold start. Trang đã sẵn sàng — danh sách sẽ hiện khi API
            /api/games trả về. Sau đó filter/search chạy ngay trên máy bạn (không gọi lại server).
          </p>
        ) : null}

        <section className="grid" aria-busy={loading}>
          {showSkeleton
            ? Array.from({ length: 4 }, (_, i) => (
                <div key={`skeleton-${i}`} className="card skeleton-card" aria-hidden="true">
                  <div className="skeleton-line skeleton-title" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ))
            : null}
          {!loading && result.content.length === 0 ? (
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

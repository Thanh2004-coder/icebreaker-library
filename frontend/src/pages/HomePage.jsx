import { useEffect, useMemo, useState } from "react";
import Header from "../components/Header.jsx";
import Filters from "../components/Filters.jsx";
import GameCard from "../components/GameCard.jsx";
import Pagination from "../components/Pagination.jsx";
import { fetchFilters, fetchGames } from "../api.js";

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
  const [filters, setFilters] = useState(null);
  const [result, setResult] = useState(null);
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

  const queryKey = useMemo(
    () => JSON.stringify({ search, selected, page }),
    [search, selected, page]
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    setSlowBackend(false);
    const slowTimer = setTimeout(() => {
      if (!cancelled) setSlowBackend(true);
    }, 4000);

    fetchGames({
      search,
      players: selected.players,
      contexts: selected.context ? [selected.context] : [],
      purposes: selected.purposes,
      duration: selected.duration,
      page,
      size: 10,
    })
      .then((data) => {
        if (!cancelled) {
          setResult(data);
          setLoading(false);
          setSlowBackend(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setResult(null);
          setLoading(false);
          setSlowBackend(false);
        }
      });
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
    };
  }, [queryKey, search, selected, page]);

  // Load filter catalog after the first games response so /api/games owns the critical path.
  useEffect(() => {
    if (loading || filters != null) return;
    let cancelled = false;
    fetchFilters()
      .then((data) => {
        if (!cancelled) setFilters(data);
      })
      .catch(() => {
        if (!cancelled) setFilters(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loading, filters]);

  const onFilterChange = (next) => {
    setSelected(next);
    setPage(0);
  };

  const showSkeleton = loading && !result?.content?.length;

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
              : `Tìm thấy ${result?.totalElements ?? 0} trò chơi`}
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
            /api/games trả về. Lần sau (máy chủ còn warm) thường dưới 2 giây.
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
          {!loading && result?.content?.length === 0 ? (
            <p className="empty">Không có trò chơi khớp. Thử nới bộ lọc hoặc xóa từ khóa.</p>
          ) : null}
          {result?.content?.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </section>

        <Pagination
          page={result?.page ?? 0}
          totalPages={result?.totalPages ?? 0}
          onPageChange={setPage}
        />
      </main>
    </div>
  );
}

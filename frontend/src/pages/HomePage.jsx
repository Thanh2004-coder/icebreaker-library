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
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
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
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setResult(null);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, search, selected, page]);

  const onFilterChange = (next) => {
    setSelected(next);
    setPage(0);
  };

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
              ? "Đang tải…"
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

        <section className="grid">
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

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 0; i < totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <nav className="pagination" aria-label="Phân trang">
      <button type="button" disabled={page <= 0} onClick={() => onPageChange(page - 1)}>
        Previous
      </button>
      <ol>
        {pages.map((item) => (
          <li key={item}>
            <button
              type="button"
              className={item === page ? "active" : ""}
              onClick={() => onPageChange(item)}
              aria-current={item === page ? "page" : undefined}
            >
              {item + 1}
            </button>
          </li>
        ))}
      </ol>
      <button type="button" disabled={page >= totalPages - 1} onClick={() => onPageChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}

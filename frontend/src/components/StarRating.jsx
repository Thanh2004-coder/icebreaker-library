export default function StarRating({ value = 0, onChange, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="stars" role={readOnly ? "img" : "radiogroup"} aria-label="Đánh giá sao">
      {stars.map((star) => {
        const active = star <= value;
        if (readOnly) {
          return (
            <span key={star} className={active ? "star on" : "star"}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={active ? "star on" : "star"}
            onClick={() => onChange(star)}
            aria-label={`${star} sao`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import SoftStatusBanner from "../components/SoftStatusBanner.jsx";
import StarRating from "../components/StarRating.jsx";
import {
  getCachedReviews,
  getGameFallback,
  loadGameDetail,
  loadGameReviews,
  refreshAfterReview,
} from "../cache/gameStore.js";
import { formatDuration, formatPlayers, formatRating } from "../api.js";

export default function GameDetailPage() {
  const { id } = useParams();
  const initial = getGameFallback(id);
  const initialReviews = getCachedReviews(id);

  const [game, setGame] = useState(initial);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsLive, setReviewsLive] = useState(initialReviews != null);
  const [error, setError] = useState("");
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fallback = getGameFallback(id);

    setError("");
    setGame(fallback || null);
    setReviews(getCachedReviews(id) || []);
    setReviewsLoading(true);
    setReviewsLive(false);

    // Content from static catalogue immediately; soft-refresh live fields when possible.
    loadGameDetail(id, { force: loadToken > 0 })
      .then((data) => {
        if (!cancelled && data) {
          setGame(data);
          setError("");
        }
      })
      .catch((err) => {
        if (cancelled) return;
        if (!getGameFallback(id)) {
          setError(err.message || "Không tải được chi tiết trò chơi.");
        }
      });

    // Reviews/ratings always from backend.
    loadGameReviews(id, { force: true })
      .then((data) => {
        if (cancelled) return;
        setReviews(data);
        setReviewsLoading(false);
        setReviewsLive(true);
      })
      .catch(() => {
        if (cancelled) return;
        setReviewsLoading(false);
        setReviewsLive(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, loadToken]);

  const onReviewCreated = () => {
    refreshAfterReview(id)
      .then(({ reviews: nextReviews, detail }) => {
        setReviews(nextReviews);
        setGame(detail);
        setReviewsLive(true);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  const onRetry = () => setLoadToken((n) => n + 1);
  const showShell = Boolean(game);

  return (
    <div className="page">
      <Header />
      <main className="layout detail-layout">
        <Link to="/" className="back">
          ← Về danh sách
        </Link>

        <SoftStatusBanner show={Boolean(showShell && !reviewsLive)} />

        {error && !showShell ? (
          <div className="error-panel" role="alert">
            <p className="error">{error}</p>
            <button type="button" className="retry-btn" onClick={onRetry}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!error && !showShell ? (
          <div className="error-panel" role="alert">
            <p className="error">Không tìm thấy trò chơi trong catalogue.</p>
            <Link to="/" className="retry-btn" style={{ display: "inline-block", textDecoration: "none" }}>
              Về danh sách
            </Link>
          </div>
        ) : null}

        {showShell ? (
          <article className="detail">
            <header>
              <p className="eyebrow">Chi tiết trò chơi</p>
              <h1>{game.name}</h1>
              <p className="card-desc">{game.description}</p>
            </header>

            <ul className="meta large">
              <li>
                <strong>Số người:</strong> {formatPlayers(game.minPlayers, game.maxPlayers)}
              </li>
              <li>
                <strong>Thời gian:</strong> {formatDuration(game.durationMin, game.durationMax)}
              </li>
              <li>
                <strong>Chuẩn bị:</strong>{" "}
                {game.preparationTime ? `${game.preparationTime} phút` : "Không cần"}
              </li>
            </ul>

            <p>
              <strong>Bối cảnh:</strong> {game.context}
            </p>
            <p>
              <strong>Mục đích:</strong> {game.purpose}
            </p>

            <div className="tag-row">
              {(game.contexts || []).map((item) => (
                <span key={item} className="tag">
                  📍 {item}
                </span>
              ))}
              {(game.purposes || []).map((item) => (
                <span key={item} className="tag purpose">
                  🎯 {item}
                </span>
              ))}
            </div>

            <section>
              <h2>Cách chơi</h2>
              <div className="prose">{game.howToPlay}</div>
            </section>

            <section>
              <h2>Chuẩn bị</h2>
              <p>{game.preparation}</p>
            </section>

            <section>
              <h2>Quy định</h2>
              <div className="prose">{game.rules}</div>
            </section>

            <section>
              <h2>Đánh giá</h2>
              <div className="rating-row">
                {game.reviewCount ? <StarRating value={Math.round(game.averageRating || 0)} readOnly /> : null}
                <strong>
                  {game.reviewCount ? `${Number(game.averageRating).toFixed(1)}/5` : "Chưa có đánh giá"}
                </strong>
                <span>{formatRating(game.averageRating, game.reviewCount)}</span>
              </div>
            </section>

            <section>
              <h2>Các review</h2>
              {reviewsLoading ? (
                <div className="skeleton-block" aria-hidden="true">
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ) : null}
              {!reviewsLoading && reviews.length === 0 ? (
                <p className="empty">Chưa có review. Hãy là người đầu tiên.</p>
              ) : null}
              <ul className="review-list">
                {reviews.map((item) => (
                  <li key={item.id} className="review-item">
                    <div className="review-head">
                      <strong>{item.displayName}</strong>
                      <StarRating value={item.rating} readOnly />
                    </div>
                    <p>{item.comment}</p>
                    <time>{new Date(item.createdAt).toLocaleString("vi-VN")}</time>
                  </li>
                ))}
              </ul>
            </section>

            <ReviewForm gameId={id} onCreated={onReviewCreated} />
          </article>
        ) : null}
      </main>
    </div>
  );
}

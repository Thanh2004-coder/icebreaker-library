import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import StarRating from "../components/StarRating.jsx";
import {
  getCachedDetail,
  getCachedReviews,
  getCachedSummary,
  loadGameDetail,
  loadGameReviews,
  refreshAfterReview,
} from "../cache/gameStore.js";
import { formatDuration, formatPlayers, formatRating } from "../api.js";

function hasFullDetail(game) {
  return Boolean(game && game.howToPlay != null && game.rules != null);
}

export default function GameDetailPage() {
  const { id } = useParams();
  const cachedSummary = getCachedSummary(id);
  const cachedDetail = getCachedDetail(id);
  const cachedReviews = getCachedReviews(id);

  const [game, setGame] = useState(cachedDetail || cachedSummary);
  const [reviews, setReviews] = useState(cachedReviews || []);
  const [detailLoading, setDetailLoading] = useState(!hasFullDetail(cachedDetail));
  const [reviewsLoading, setReviewsLoading] = useState(cachedReviews == null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const summary = getCachedSummary(id);
    const detail = getCachedDetail(id);
    const existingReviews = getCachedReviews(id);

    setError("");
    setGame(detail || summary || null);
    setReviews(existingReviews || []);
    setDetailLoading(!hasFullDetail(detail));
    setReviewsLoading(existingReviews == null);

    const tasks = [];

    if (!hasFullDetail(detail)) {
      tasks.push(
        loadGameDetail(id)
          .then((data) => {
            if (!cancelled) {
              setGame(data);
              setDetailLoading(false);
            }
          })
          .catch((err) => {
            if (!cancelled) {
              setError(err.message);
              setDetailLoading(false);
            }
          })
      );
    }

    if (existingReviews == null) {
      tasks.push(
        loadGameReviews(id)
          .then((data) => {
            if (!cancelled) {
              setReviews(data);
              setReviewsLoading(false);
            }
          })
          .catch((err) => {
            if (!cancelled) {
              if (!getCachedSummary(id) && !getCachedDetail(id)) {
                setError(err.message);
              }
              setReviewsLoading(false);
            }
          })
      );
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  const onReviewCreated = () => {
    refreshAfterReview(id)
      .then(({ reviews: nextReviews, detail }) => {
        setReviews(nextReviews);
        setGame(detail);
      })
      .catch((err) => setError(err.message));
  };

  const showShell = Boolean(game);

  return (
    <div className="page">
      <Header />
      <main className="layout detail-layout">
        <Link to="/" className="back">
          ← Về danh sách
        </Link>

        {error ? <p className="error">{error}</p> : null}
        {!error && !showShell ? <p>Đang tải chi tiết trò chơi…</p> : null}

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
              {detailLoading && game.howToPlay == null ? (
                <div className="skeleton-block" aria-hidden="true">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ) : (
                <div className="prose">{game.howToPlay}</div>
              )}
            </section>

            <section>
              <h2>Chuẩn bị</h2>
              {detailLoading && game.preparation == null ? (
                <div className="skeleton-line skeleton-short" aria-hidden="true" />
              ) : (
                <p>{game.preparation}</p>
              )}
            </section>

            <section>
              <h2>Quy định</h2>
              {detailLoading && game.rules == null ? (
                <div className="skeleton-block" aria-hidden="true">
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ) : (
                <div className="prose">{game.rules}</div>
              )}
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

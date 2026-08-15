import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import SoftStatusBanner from "../components/SoftStatusBanner.jsx";
import StarRating from "../components/StarRating.jsx";
import {
  getCachedDetail,
  getCachedReviews,
  getGameFallback,
  loadGameDetail,
  loadGameReviews,
  refreshAfterReview,
} from "../cache/gameStore.js";
import { formatDuration, formatPlayers, formatRating } from "../api.js";

const SKELETON_MAX_MS = 3500;

function hasFullDetail(game) {
  return Boolean(game && game.howToPlay != null && game.rules != null);
}

export default function GameDetailPage() {
  const { id } = useParams();
  const initial = getGameFallback(id);
  const initialReviews = getCachedReviews(id);

  const [game, setGame] = useState(initial);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [detailLoading, setDetailLoading] = useState(!hasFullDetail(initial));
  const [reviewsLoading, setReviewsLoading] = useState(initialReviews == null);
  const [usingFallback, setUsingFallback] = useState(Boolean(initial) && !hasFullDetail(initial));
  const [liveOk, setLiveOk] = useState(hasFullDetail(initial));
  const [error, setError] = useState("");
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fallback = getGameFallback(id);
    const existingReviews = getCachedReviews(id);
    const fullCached = hasFullDetail(getCachedDetail(id));

    setError("");
    setGame(fallback || null);
    setReviews(existingReviews || []);
    setDetailLoading(!fullCached);
    setReviewsLoading(existingReviews == null);
    setUsingFallback(Boolean(fallback) && !fullCached);
    setLiveOk(fullCached);

    const skeletonTimer = setTimeout(() => {
      if (!cancelled) setDetailLoading(false);
    }, SKELETON_MAX_MS);

    const needDetail = !fullCached || loadToken > 0;
    const needReviews = existingReviews == null || loadToken > 0;

    if (needDetail) {
      loadGameDetail(id, { force: loadToken > 0 })
        .then((data) => {
          if (cancelled) return;
          setGame(data);
          setDetailLoading(false);
          setUsingFallback(false);
          setLiveOk(true);
          setError("");
        })
        .catch((err) => {
          if (cancelled) return;
          const still = getGameFallback(id);
          if (still) {
            setGame(still);
            setUsingFallback(true);
            setError("");
          } else {
            setError(err.message || "Không tải được chi tiết trò chơi.");
          }
          setDetailLoading(false);
          setLiveOk(false);
        });
    }

    if (needReviews) {
      loadGameReviews(id, { force: loadToken > 0 })
        .then((data) => {
          if (cancelled) return;
          setReviews(data);
          setReviewsLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setReviewsLoading(false);
          if (!getGameFallback(id)) {
            setError((prev) => prev || "Không tải được review.");
          }
        });
    }

    return () => {
      cancelled = true;
      clearTimeout(skeletonTimer);
    };
  }, [id, loadToken]);

  const onReviewCreated = () => {
    refreshAfterReview(id)
      .then(({ reviews: nextReviews, detail }) => {
        setReviews(nextReviews);
        setGame(detail);
        setUsingFallback(false);
        setLiveOk(true);
        setError("");
      })
      .catch((err) => setError(err.message));
  };

  const onRetry = () => setLoadToken((n) => n + 1);
  const showShell = Boolean(game);
  const showSoftBanner = showShell && (usingFallback || (!liveOk && showShell));

  return (
    <div className="page">
      <Header />
      <main className="layout detail-layout">
        <Link to="/" className="back">
          ← Về danh sách
        </Link>

        <SoftStatusBanner show={showSoftBanner} />

        {error && !showShell ? (
          <div className="error-panel" role="alert">
            <p className="error">{error}</p>
            <button type="button" className="retry-btn" onClick={onRetry}>
              Thử lại
            </button>
          </div>
        ) : null}

        {!error && !showShell && detailLoading ? <p>Đang tải chi tiết trò chơi…</p> : null}

        {!error && !showShell && !detailLoading ? (
          <div className="error-panel" role="alert">
            <p className="error">Không tìm thấy trò chơi hoặc máy chủ chưa phản hồi.</p>
            <button type="button" className="retry-btn" onClick={onRetry}>
              Thử lại
            </button>
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
              {detailLoading && game.howToPlay == null ? (
                <div className="skeleton-block" aria-hidden="true">
                  <div className="skeleton-line" />
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ) : game.howToPlay != null ? (
                <div className="prose">{game.howToPlay}</div>
              ) : (
                <p className="empty">Nội dung chi tiết sẽ hiện khi máy chủ sẵn sàng.</p>
              )}
            </section>

            <section>
              <h2>Chuẩn bị</h2>
              {detailLoading && game.preparation == null ? (
                <div className="skeleton-line skeleton-short" aria-hidden="true" />
              ) : (
                <p>{game.preparation || (usingFallback ? "—" : "")}</p>
              )}
            </section>

            <section>
              <h2>Quy định</h2>
              {detailLoading && game.rules == null ? (
                <div className="skeleton-block" aria-hidden="true">
                  <div className="skeleton-line" />
                  <div className="skeleton-line skeleton-short" />
                </div>
              ) : game.rules != null ? (
                <div className="prose">{game.rules}</div>
              ) : (
                <p className="empty">Nội dung chi tiết sẽ hiện khi máy chủ sẵn sàng.</p>
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

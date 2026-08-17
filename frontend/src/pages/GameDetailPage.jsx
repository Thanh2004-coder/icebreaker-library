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
import {
  FALLBACK_GAME_IMAGE,
  FALLBACK_INSTRUCTION_IMAGE,
  getGameImage,
  getGameInstructionImage,
  getHowToPlaySteps,
  getStaticGameById,
  onCatalogImageError,
} from "../data/staticCatalog.js";

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
  const catalogGame = getStaticGameById(id);
  // Render from catalogue image fields even if live/cache payload omits them.
  const view = game
    ? {
        ...catalogGame,
        ...game,
        heroImage: catalogGame?.heroImage || game.heroImage,
        instructionImage: catalogGame?.instructionImage || game.instructionImage,
        howToPlay: catalogGame?.howToPlay ?? game.howToPlay,
        preparation: catalogGame?.preparation ?? game.preparation,
        rules: catalogGame?.rules ?? game.rules,
      }
    : null;
  const showShell = Boolean(view);
  const howToPlaySteps = showShell ? getHowToPlaySteps(view) : [];
  const heroSrc = view?.heroImage || getGameImage(view);
  const instructionSrc = getGameInstructionImage(view);

  return (
    <div className="page">
      <Header />
      <main className="layout detail-layout">
        <Link to="/" className="back">
          ← Về danh sách
        </Link>

        {showShell ? (
          <img
            key={`hero-${view.id}`}
            className="detail-hero"
            src={heroSrc}
            alt={view.name}
            width="640"
            height="360"
            onError={onCatalogImageError(FALLBACK_GAME_IMAGE)}
          />
        ) : null}

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
              <h1>{view.name}</h1>
              <p className="card-desc">{view.description}</p>
            </header>

            <ul className="meta large">
              <li>
                <strong>Số người:</strong> {formatPlayers(view.minPlayers, view.maxPlayers)}
              </li>
              <li>
                <strong>Thời gian:</strong> {formatDuration(view.durationMin, view.durationMax)}
              </li>
              <li>
                <strong>Chuẩn bị:</strong>{" "}
                {view.preparationTime ? `${view.preparationTime} phút` : "Không cần"}
              </li>
            </ul>

            <p>
              <strong>Bối cảnh:</strong> {view.context}
            </p>
            <p>
              <strong>Mục đích:</strong> {view.purpose}
            </p>

            <div className="tag-row">
              {(view.contexts || []).map((item) => (
                <span key={item} className="tag">
                  📍 {item}
                </span>
              ))}
              {(view.purposes || []).map((item) => (
                <span key={item} className="tag purpose">
                  🎯 {item}
                </span>
              ))}
            </div>

            <section>
              <h2>Cách chơi</h2>
              <img
                key={`instruction-${view.id}`}
                className="detail-instruction"
                src={instructionSrc}
                alt={`Cách chơi ${view.name}`}
                width="640"
                height="360"
                onError={onCatalogImageError(FALLBACK_INSTRUCTION_IMAGE)}
              />
              {howToPlaySteps.length ? (
                <ol className="how-to-steps">
                  {howToPlaySteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              ) : null}
            </section>

            <section>
              <h2>Chuẩn bị</h2>
              <p>{Array.isArray(view.preparation) ? view.preparation.join("\n") : view.preparation}</p>
            </section>

            <section>
              <h2>Quy định</h2>
              <div className="prose">
                {Array.isArray(view.rules) ? view.rules.join("\n") : view.rules}
              </div>
            </section>

            <section>
              <h2>Đánh giá</h2>
              <div className="rating-row">
                {view.reviewCount ? <StarRating value={Math.round(view.averageRating || 0)} readOnly /> : null}
                <strong>
                  {view.reviewCount ? `${Number(view.averageRating).toFixed(1)}/5` : "Chưa có đánh giá"}
                </strong>
                <span>{formatRating(view.averageRating, view.reviewCount)}</span>
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

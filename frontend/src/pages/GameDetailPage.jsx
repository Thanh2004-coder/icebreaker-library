import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import ReviewForm from "../components/ReviewForm.jsx";
import StarRating from "../components/StarRating.jsx";
import { fetchGame, fetchReviews, formatDuration, formatPlayers, formatRating } from "../api.js";

export default function GameDetailPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    setError("");
    Promise.all([fetchGame(id), fetchReviews(id)])
      .then(([gameData, reviewData]) => {
        setGame(gameData);
        setReviews(reviewData);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(() => {
    setGame(null);
    setReviews([]);
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div className="page">
      <Header />
      <main className="layout detail-layout">
        <Link to="/" className="back">
          ← Về danh sách
        </Link>

        {error ? <p className="error">{error}</p> : null}
        {!error && !game ? <p>Đang tải chi tiết trò chơi…</p> : null}

        {game ? (
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
                <strong>Chuẩn bị:</strong> {game.preparationTime ? `${game.preparationTime} phút` : "Không cần"}
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
              {reviews.length === 0 ? <p className="empty">Chưa có review. Hãy là người đầu tiên.</p> : null}
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

            <ReviewForm gameId={id} onCreated={load} />
          </article>
        ) : null}
      </main>
    </div>
  );
}

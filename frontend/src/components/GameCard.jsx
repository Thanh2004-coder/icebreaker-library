import { Link } from "react-router-dom";
import { formatDuration, formatPlayers, formatRating } from "../api.js";
import StarRating from "./StarRating.jsx";

export default function GameCard({ game }) {
  const purposes = game.purposes?.length ? game.purposes : (game.purpose ? game.purpose.split(", ") : []);
  const context = game.contexts?.[0] || game.context;
  return (
    <article className="card">
      <div className="card-top">
        <h2>{game.name}</h2>
      </div>
      <p className="card-desc">{game.description}</p>
      <ul className="meta">
        <li>👥 {formatPlayers(game.minPlayers, game.maxPlayers)}</li>
        <li>📍 {context}</li>
        <li>⏱ {formatDuration(game.durationMin, game.durationMax)}</li>
      </ul>
      <div className="tag-row">
        {purposes.map((item) => (
          <span key={item} className="tag purpose">
            🎯 {item}
          </span>
        ))}
      </div>
      <div className="rating-row">
        {game.reviewCount ? <StarRating value={Math.round(game.averageRating || 0)} readOnly /> : null}
        <span>{formatRating(game.averageRating, game.reviewCount)}</span>
      </div>
      <Link to={`/games/${game.id}`} className="detail-link">
        Xem chi tiết
      </Link>
    </article>
  );
}

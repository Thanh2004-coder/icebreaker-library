import { useState } from "react";
import StarRating from "./StarRating.jsx";
import { createReview } from "../api.js";

export default function ReviewForm({ gameId, onCreated }) {
  const [displayName, setDisplayName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    if (!displayName.trim() || !comment.trim() || rating < 1 || rating > 5) {
      setError("Điền tên, chọn sao từ 1–5 và viết nội dung đánh giá.");
      return;
    }
    setSending(true);
    try {
      await createReview(gameId, {
        displayName: displayName.trim(),
        rating,
        comment: comment.trim(),
      });
      setComment("");
      onCreated?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form className="review-form" onSubmit={submit}>
      <h3>Viết đánh giá</h3>
      <label>
        Tên hiển thị
        <input
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          maxLength={80}
          required
          placeholder="Tên hoặc biệt danh"
        />
      </label>
      <div>
        <span className="field-label">Đánh giá</span>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <label>
        Nội dung
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={1000}
          required
          rows={4}
          placeholder="Trò này chơi với nhóm 5 người online thế nào?"
        />
      </label>
      {error ? <p className="error">{error}</p> : null}
      <button type="submit" disabled={sending}>
        {sending ? "Đang gửi…" : "Gửi đánh giá"}
      </button>
    </form>
  );
}

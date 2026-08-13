const API_BASE = import.meta.env.VITE_API_URL || "";

async function parseError(response) {
  try {
    const body = await response.json();
    if (body?.message) return body.message;
  } catch {
    /* ignore */
  }
  if (response.status === 404) return "Không tìm thấy trò chơi.";
  if (response.status === 400) return "Dữ liệu gửi lên chưa hợp lệ.";
  return "Không tải được dữ liệu từ server.";
}

async function getJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export function fetchGames(params) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  if (params.search) query.set("search", params.search);
  if (params.players) query.set("players", params.players);
  if (params.contexts?.length) query.set("context", params.contexts.join(","));
  if (params.purposes?.length) query.set("purpose", params.purposes.join(","));
  if (params.duration) query.set("duration", params.duration);
  const qs = query.toString().replace(/players=10\+/g, "players=10%2B");
  return getJson(`/api/games?${qs}`);
}

export function fetchGame(id) {
  return getJson(`/api/games/${id}`);
}

export function fetchFilters() {
  return getJson("/api/filters");
}

export function fetchReviews(gameId) {
  return getJson(`/api/games/${gameId}/reviews`);
}

export async function createReview(gameId, payload) {
  const response = await fetch(`${API_BASE}/api/games/${gameId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));
  return response.json();
}

export function formatPlayers(min, max) {
  if (max == null) return `${min}+ người`;
  if (min === max) return `${min} người`;
  return `${min}–${max} người`;
}

export function formatDuration(min, max) {
  if (min === max) return `${min} phút`;
  return `${min}–${max} phút`;
}

export function formatRating(averageRating, reviewCount) {
  if (!reviewCount) return "Chưa có đánh giá";
  return `⭐ ${Number(averageRating).toFixed(1)} (${reviewCount} reviews)`;
}

/**
 * API client for Spring Boot backend.
 *
 * Local (Vite): leave VITE_API_URL empty → requests go to /api/... and Vite proxies to localhost:8080.
 * Production (Vercel): set VITE_API_URL to the public Spring Boot base URL, e.g.
 *   https://your-service.onrender.com
 * with NO trailing slash. Paths are always /api/...
 */

function normalizeApiBase(raw) {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

const API_BASE = normalizeApiBase(import.meta.env.VITE_API_URL);

function apiUrl(path) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${normalizedPath}`;
}

async function parseError(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  if (contentType.includes("application/json") || text.trim().startsWith("{") || text.trim().startsWith("[")) {
    try {
      const body = JSON.parse(text);
      if (body?.message) return body.message;
    } catch {
      /* fall through */
    }
  }

  if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("Whitelabel Error Page")) {
    if (!API_BASE && import.meta.env.PROD) {
      return "Frontend chưa cấu hình VITE_API_URL (URL Spring Boot trên Render). Đang nhận HTML thay vì JSON từ API.";
    }
    return `API trả về HTML (HTTP ${response.status}) thay vì JSON. Kiểm tra VITE_API_URL và endpoint backend /api/...`;
  }

  if (response.status === 404) return "Không tìm thấy tài nguyên API (404).";
  if (response.status === 400) return "Dữ liệu gửi lên chưa hợp lệ.";
  return `Không tải được dữ liệu từ server (HTTP ${response.status}).`;
}

async function getJson(path, { signal, timeoutMs } = {}) {
  if (!API_BASE && import.meta.env.PROD) {
    throw new Error(
      "Thiếu VITE_API_URL. Trên Vercel hãy set VITE_API_URL=https://<backend>.onrender.com rồi Redeploy."
    );
  }

  const controller = new AbortController();
  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", onAbort, { once: true });
  }

  let timer;
  if (timeoutMs && timeoutMs > 0) {
    timer = setTimeout(() => controller.abort(), timeoutMs);
  }

  try {
    const response = await fetch(apiUrl(path), { signal: controller.signal });
    if (!response.ok) throw new Error(await parseError(response));

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();
    if (!contentType.includes("application/json") && !text.trim().startsWith("{") && !text.trim().startsWith("[")) {
      throw new Error(buildHtmlMismatchMessage(response.status, text));
    }
    try {
      return JSON.parse(text);
    } catch {
      throw new Error("Phản hồi API không phải JSON hợp lệ.");
    }
  } catch (err) {
    if (err?.name === "AbortError") {
      throw new Error("Yêu cầu quá lâu hoặc đã bị hủy. Máy chủ có thể đang khởi động.");
    }
    throw err;
  } finally {
    if (timer) clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
  }
}

function buildHtmlMismatchMessage(status, text) {
  if (text.trim().toLowerCase().startsWith("<!doctype") || text.includes("Whitelabel Error Page")) {
    if (!API_BASE && import.meta.env.PROD) {
      return "Frontend chưa cấu hình VITE_API_URL (URL Spring Boot trên Render). Đang nhận HTML thay vì JSON từ API.";
    }
    return `API trả về HTML (HTTP ${status}) thay vì JSON. Kiểm tra VITE_API_URL và endpoint backend /api/...`;
  }
  return `Phản hồi API không phải JSON (HTTP ${status}).`;
}

/** Wake / probe Render. One request — do not poll in a tight loop. */
export function fetchHealth(options) {
  return getJson("/api/health", options);
}

export function fetchGames(params, options) {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  if (params.search) query.set("search", params.search);
  if (params.players) query.set("players", params.players);
  if (params.contexts?.length) query.set("context", params.contexts.join(","));
  if (params.purposes?.length) query.set("purpose", params.purposes.join(","));
  if (params.duration) query.set("duration", params.duration);
  const qs = query.toString().replace(/players=10\+/g, "players=10%2B");
  return getJson(`/api/games?${qs}`, options);
}

export function fetchGame(id, options) {
  return getJson(`/api/games/${id}`, options);
}

export function fetchFilters(options) {
  return getJson("/api/filters", options);
}

export function fetchReviews(gameId, options) {
  return getJson(`/api/games/${gameId}/reviews`, options);
}

export async function createReview(gameId, payload) {
  if (!API_BASE && import.meta.env.PROD) {
    throw new Error(
      "Thiếu VITE_API_URL. Trên Vercel hãy set VITE_API_URL=https://<backend>.onrender.com rồi Redeploy."
    );
  }

  const response = await fetch(apiUrl(`/api/games/${gameId}/reviews`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(await parseError(response));

  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();
  if (!contentType.includes("application/json") && !text.trim().startsWith("{")) {
    throw new Error(buildHtmlMismatchMessage(response.status, text));
  }
  return JSON.parse(text);
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

export function getApiBaseForDebug() {
  return API_BASE || "(relative /api → Vite proxy in local, or MISSING VITE_API_URL in production)";
}

export function getApiBase() {
  return API_BASE;
}

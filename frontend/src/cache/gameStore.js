/**
 * Catalog cache (memory + localStorage) + single-flight network loads.
 * Cold start: wake /api/health once, then /api/games once — no spam retries.
 */

import {
  fetchFilters,
  fetchGame,
  fetchGames,
  fetchHealth,
  fetchReviews,
  getApiBase,
} from "../api.js";

const PAGE_SIZE = 10;
const CATALOG_SIZE = 50;
const LS_GAMES = "warmup.catalog.v1";
const LS_FILTERS = "warmup.filters.v1";

/** Allow long Render cold start on a single health request (no tight poll loop). */
const HEALTH_TIMEOUT_MS = 180_000;
const GAMES_TIMEOUT_MS = 120_000;

/** Built-in filter shell so Home can show players/duration before /api/filters returns. */
export const DEFAULT_FILTER_CATALOG = {
  players: [
    { value: "2", label: "2 người" },
    { value: "3-4", label: "3–4 người" },
    { value: "5", label: "5 người" },
    { value: "6-10", label: "6–10 người" },
    { value: "10+", label: "10+ người" },
  ],
  contexts: [],
  purposes: [],
  durations: [
    { value: "under-5", label: "Dưới 5 phút" },
    { value: "5-7", label: "5–7 phút" },
    { value: "8-10", label: "8–10 phút" },
    { value: "10-15", label: "10–15 phút" },
    { value: "over-15", label: "Trên 15 phút" },
  ],
};

let catalogPromise = null;
let catalogGames = null;
let filtersPromise = null;
let filtersCache = null;
let wakePromise = null;

const summaryById = new Map();
const detailById = new Map();
const reviewsById = new Map();
const detailInflight = new Map();
const reviewsInflight = new Map();

function rememberSummary(game) {
  if (game?.id == null) return;
  summaryById.set(Number(game.id), game);
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readPersistedGames() {
  if (typeof localStorage === "undefined") return null;
  const parsed = safeParse(localStorage.getItem(LS_GAMES));
  if (!Array.isArray(parsed) || parsed.length === 0) return null;
  return parsed;
}

export function readPersistedFilters() {
  if (typeof localStorage === "undefined") return null;
  const parsed = safeParse(localStorage.getItem(LS_FILTERS));
  if (!parsed || !Array.isArray(parsed.players)) return null;
  return parsed;
}

function persistGames(games) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_GAMES, JSON.stringify(games));
  } catch {
    /* quota / private mode */
  }
}

function persistFilters(data) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_FILTERS, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

function hydrateFromPersisted() {
  if (!catalogGames) {
    const persisted = readPersistedGames();
    if (persisted) {
      catalogGames = persisted;
      catalogGames.forEach(rememberSummary);
    }
  }
  if (!filtersCache) {
    const persisted = readPersistedFilters();
    if (persisted) filtersCache = persisted;
  }
}

hydrateFromPersisted();

/** Kick Render as early as this module loads (PROD only). Single-flight. */
export function wakeBackendEarly() {
  if (!import.meta.env.PROD || !getApiBase()) {
    return Promise.resolve(true);
  }
  if (!wakePromise) {
    wakePromise = fetchHealth({ timeoutMs: HEALTH_TIMEOUT_MS })
      .then(() => true)
      .catch(() => {
        wakePromise = null;
        return false;
      });
  }
  return wakePromise;
}

if (import.meta.env.PROD && getApiBase()) {
  wakeBackendEarly();
}

export function getCachedSummary(id) {
  const key = Number(id);
  const hit = summaryById.get(key);
  if (hit) return hit;
  const list = catalogGames || readPersistedGames() || [];
  const fromList = list.find((g) => Number(g.id) === key);
  if (fromList) {
    rememberSummary(fromList);
    return fromList;
  }
  return null;
}

/** Best available game payload for detail UI without network. */
export function getGameFallback(id) {
  return getCachedDetail(id) || getCachedSummary(id) || null;
}

export function getCachedDetail(id) {
  return detailById.get(Number(id)) || null;
}

export function getCachedReviews(id) {
  return reviewsById.has(Number(id)) ? reviewsById.get(Number(id)) : null;
}

export function getCachedFilters() {
  return filtersCache || readPersistedFilters();
}

export function getMemoryCatalog() {
  return catalogGames || readPersistedGames();
}

export function loadFilterCatalog({ force = false } = {}) {
  if (force) {
    filtersPromise = null;
  }
  if (!force && filtersCache) return Promise.resolve(filtersCache);
  if (filtersPromise) return filtersPromise;

  filtersPromise = (async () => {
    await wakeBackendEarly();
    const data = await fetchFilters({ timeoutMs: GAMES_TIMEOUT_MS });
    filtersCache = data;
    persistFilters(data);
    return data;
  })().catch((err) => {
    filtersPromise = null;
    throw err;
  });

  return filtersPromise;
}

/**
 * Load full game list once. Uses memory/localStorage for instant UI.
 * Network: wake health → one /api/games. force=true for Retry button.
 */
export function loadGameCatalog({ force = false } = {}) {
  if (force) {
    catalogPromise = null;
  }
  if (!force && catalogGames?.length) {
    return Promise.resolve(catalogGames);
  }
  if (catalogPromise) {
    return catalogPromise;
  }

  catalogPromise = (async () => {
    await wakeBackendEarly();
    const data = await fetchGames({ page: 0, size: CATALOG_SIZE }, { timeoutMs: GAMES_TIMEOUT_MS });
    catalogGames = Array.isArray(data?.content) ? data.content : [];
    catalogGames.forEach(rememberSummary);
    persistGames(catalogGames);
    return catalogGames;
  })().catch((err) => {
    catalogPromise = null;
    throw err;
  });

  return catalogPromise;
}

export function loadGameDetail(id, { force = false } = {}) {
  const key = Number(id);
  if (!force && detailById.has(key)) {
    return Promise.resolve(detailById.get(key));
  }
  if (!force && detailInflight.has(key)) {
    return detailInflight.get(key);
  }
  const req = (async () => {
    await wakeBackendEarly();
    return fetchGame(key, { timeoutMs: GAMES_TIMEOUT_MS });
  })()
    .then((data) => {
      detailById.set(key, data);
      rememberSummary({
        id: data.id,
        name: data.name,
        description: data.description,
        durationMin: data.durationMin,
        durationMax: data.durationMax,
        minPlayers: data.minPlayers,
        maxPlayers: data.maxPlayers,
        context: data.context,
        purpose: data.purpose,
        preparation: data.preparation,
        preparationRequired: data.preparationRequired,
        preparationTime: data.preparationTime,
        averageRating: data.averageRating,
        reviewCount: data.reviewCount,
        contexts: data.contexts,
        purposes: data.purposes,
      });
      return data;
    })
    .finally(() => {
      detailInflight.delete(key);
    });
  detailInflight.set(key, req);
  return req;
}

export function loadGameReviews(id, { force = false } = {}) {
  const key = Number(id);
  if (!force && reviewsById.has(key)) {
    return Promise.resolve(reviewsById.get(key));
  }
  if (!force && reviewsInflight.has(key)) {
    return reviewsInflight.get(key);
  }
  const req = (async () => {
    await wakeBackendEarly();
    return fetchReviews(key, { timeoutMs: GAMES_TIMEOUT_MS });
  })()
    .then((data) => {
      const list = Array.isArray(data) ? data : [];
      reviewsById.set(key, list);
      return list;
    })
    .finally(() => {
      reviewsInflight.delete(key);
    });
  reviewsInflight.set(key, req);
  return req;
}

export async function refreshAfterReview(id) {
  const key = Number(id);
  const [reviews, detail] = await Promise.all([
    loadGameReviews(key, { force: true }),
    loadGameDetail(key, { force: true }),
  ]);
  if (catalogGames) {
    catalogGames = catalogGames.map((g) =>
      Number(g.id) === key
        ? {
            ...g,
            averageRating: detail.averageRating,
            reviewCount: detail.reviewCount,
          }
        : g
    );
    persistGames(catalogGames);
    rememberSummary(catalogGames.find((g) => Number(g.id) === key));
  }
  return { reviews, detail };
}

export function pageSize() {
  return PAGE_SIZE;
}

export function mergeFilterCatalog(apiFilters) {
  if (!apiFilters) return { ...DEFAULT_FILTER_CATALOG };
  return {
    players: apiFilters.players?.length ? apiFilters.players : DEFAULT_FILTER_CATALOG.players,
    contexts: apiFilters.contexts || [],
    purposes: apiFilters.purposes || [],
    durations: apiFilters.durations?.length ? apiFilters.durations : DEFAULT_FILTER_CATALOG.durations,
  };
}

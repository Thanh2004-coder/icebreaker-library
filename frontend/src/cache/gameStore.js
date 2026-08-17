/**
 * Catalog: static 20 games for instant Home/Detail.
 * Network only for health wake (optional), reviews/ratings, and optional rating soft-refresh.
 */

import {
  fetchFilters,
  fetchGame,
  fetchGames,
  fetchHealth,
  fetchReviews,
  getApiBase,
} from "../api.js";
import { STATIC_FILTERS, STATIC_GAMES, getStaticGameById } from "../data/staticCatalog.js";

/** Catalogue is source of truth for game content; live API only supplies ratings. */
function withCatalogImage(live, key) {
  if (!live) return live;
  const catalog = getStaticGameById(key) || getCachedSummary(key) || {};
  return {
    ...catalog,
    ...live,
    image: catalog.image || live.image,
    heroImage: catalog.heroImage || live.heroImage,
    instructionImage: catalog.instructionImage || live.instructionImage,
    howToPlay: catalog.howToPlay ?? live.howToPlay,
    preparation: catalog.preparation ?? live.preparation,
    rules: catalog.rules ?? live.rules,
    averageRating: live.averageRating ?? catalog.averageRating,
    reviewCount: live.reviewCount ?? catalog.reviewCount,
  };
}

const PAGE_SIZE = 10;
const CATALOG_SIZE = 50;
const LS_GAMES = "warmup.catalog.v1";
const LS_FILTERS = "warmup.filters.v1";

const HEALTH_TIMEOUT_MS = 180_000;
const GAMES_TIMEOUT_MS = 120_000;

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
let ratingsRefreshPromise = null;

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

function persistGames(games) {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(LS_GAMES, JSON.stringify(games));
  } catch {
    /* ignore */
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

/** Seed memory from bundled static catalogue (source of truth for offline Home/Detail). */
function seedStaticCatalog() {
  catalogGames = STATIC_GAMES.map((g) => ({ ...g }));
  catalogGames.forEach((g) => {
    rememberSummary(g);
    detailById.set(Number(g.id), { ...g });
  });
  filtersCache = mergeFilterCatalog(STATIC_FILTERS);
}

seedStaticCatalog();

/** Merge previously saved ratings onto static rows if present. */
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

(function mergePersistedRatings() {
  const persisted = readPersistedGames();
  if (!persisted || !catalogGames) return;
  const byId = new Map(persisted.map((g) => [Number(g.id), g]));
  catalogGames = catalogGames.map((g) => {
    const p = byId.get(Number(g.id));
    if (!p) return g;
    const next = {
      ...g,
      averageRating: p.averageRating ?? g.averageRating,
      reviewCount: p.reviewCount ?? g.reviewCount,
    };
    rememberSummary(next);
    const detail = detailById.get(Number(g.id));
    if (detail) {
      detailById.set(Number(g.id), {
        ...detail,
        averageRating: next.averageRating,
        reviewCount: next.reviewCount,
      });
    }
    return next;
  });
})();

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
  const staticHit = getStaticGameById(key);
  if (staticHit) {
    rememberSummary(staticHit);
    return staticHit;
  }
  return null;
}

export function getGameFallback(id) {
  return getCachedDetail(id) || getCachedSummary(id) || getStaticGameById(id) || null;
}

export function getCachedDetail(id) {
  return detailById.get(Number(id)) || null;
}

export function getCachedReviews(id) {
  return reviewsById.has(Number(id)) ? reviewsById.get(Number(id)) : null;
}

export function getCachedFilters() {
  return filtersCache || mergeFilterCatalog(STATIC_FILTERS);
}

export function getMemoryCatalog() {
  return catalogGames || STATIC_GAMES;
}

export function getStaticCatalog() {
  return getMemoryCatalog();
}

export function loadFilterCatalog({ force = false } = {}) {
  // Static filters always available; network refresh is optional.
  if (!force) {
    return Promise.resolve(getCachedFilters());
  }
  if (filtersPromise) return filtersPromise;

  filtersPromise = (async () => {
    await wakeBackendEarly();
    const data = await fetchFilters({ timeoutMs: GAMES_TIMEOUT_MS });
    filtersCache = mergeFilterCatalog(data);
    persistFilters(filtersCache);
    return filtersCache;
  })().catch((err) => {
    filtersPromise = null;
    throw err;
  });

  return filtersPromise;
}

/**
 * Optional background rating refresh. Does not block Home first paint.
 * Catalogue content stays static; only averageRating/reviewCount may update.
 */
export function softRefreshCatalogRatings() {
  if (ratingsRefreshPromise) return ratingsRefreshPromise;

  ratingsRefreshPromise = (async () => {
    await wakeBackendEarly();
    const data = await fetchGames({ page: 0, size: CATALOG_SIZE }, { timeoutMs: GAMES_TIMEOUT_MS });
    const rows = Array.isArray(data?.content) ? data.content : [];
    const ratingById = new Map(rows.map((g) => [Number(g.id), g]));
    catalogGames = (catalogGames || STATIC_GAMES).map((g) => {
      const live = ratingById.get(Number(g.id));
      if (!live) return g;
      const next = {
        ...g,
        averageRating: live.averageRating,
        reviewCount: live.reviewCount,
      };
      rememberSummary(next);
      const detail = detailById.get(Number(g.id));
      if (detail) {
        detailById.set(Number(g.id), {
          ...detail,
          averageRating: next.averageRating,
          reviewCount: next.reviewCount,
        });
      }
      return next;
    });
    persistGames(catalogGames);
    return catalogGames;
  })()
    .catch((err) => {
      ratingsRefreshPromise = null;
      throw err;
    })
    .finally(() => {
      /* keep resolved promise for dedupe until page reload */
    });

  return ratingsRefreshPromise;
}

/** @deprecated Prefer getStaticCatalog(); kept for callers that force network. */
export function loadGameCatalog({ force = false } = {}) {
  if (!force) {
    return Promise.resolve(getMemoryCatalog());
  }
  return softRefreshCatalogRatings();
}

export function loadGameDetail(id, { force = false } = {}) {
  const key = Number(id);
  const staticDetail = getStaticGameById(key) || getCachedDetail(key);

  if (!force && staticDetail && staticDetail.howToPlay != null) {
    detailById.set(key, { ...getCachedDetail(key), ...staticDetail });
    // Soft-refresh live ratings/detail in background when online.
    if (!detailInflight.has(key)) {
      const bg = (async () => {
        await wakeBackendEarly();
        return fetchGame(key, { timeoutMs: GAMES_TIMEOUT_MS });
      })()
        .then((data) => {
          const merged = withCatalogImage(data, key);
          detailById.set(key, merged);
          rememberSummary({
            id: merged.id,
            name: merged.name,
            description: merged.description,
            image: merged.image,
            heroImage: merged.heroImage,
            instructionImage: merged.instructionImage,
            durationMin: merged.durationMin,
            durationMax: merged.durationMax,
            minPlayers: merged.minPlayers,
            maxPlayers: merged.maxPlayers,
            context: merged.context,
            purpose: merged.purpose,
            preparation: merged.preparation,
            preparationRequired: merged.preparationRequired,
            preparationTime: merged.preparationTime,
            averageRating: merged.averageRating,
            reviewCount: merged.reviewCount,
            contexts: merged.contexts,
            purposes: merged.purposes,
          });
          return merged;
        })
        .catch(() => staticDetail)
        .finally(() => {
          detailInflight.delete(key);
        });
      detailInflight.set(key, bg);
    }
    return Promise.resolve(detailById.get(key) || staticDetail);
  }

  if (!force && detailInflight.has(key)) {
    return detailInflight.get(key);
  }

  const req = (async () => {
    await wakeBackendEarly();
    return fetchGame(key, { timeoutMs: GAMES_TIMEOUT_MS });
  })()
    .then((data) => {
      const merged = withCatalogImage(data, key);
      detailById.set(key, merged);
      rememberSummary({
        id: merged.id,
        name: merged.name,
        description: merged.description,
        image: merged.image,
        heroImage: merged.heroImage,
        instructionImage: merged.instructionImage,
        durationMin: merged.durationMin,
        durationMax: merged.durationMax,
        minPlayers: merged.minPlayers,
        maxPlayers: merged.maxPlayers,
        context: merged.context,
        purpose: merged.purpose,
        preparation: merged.preparation,
        preparationRequired: merged.preparationRequired,
        preparationTime: merged.preparationTime,
        averageRating: merged.averageRating,
        reviewCount: merged.reviewCount,
        contexts: merged.contexts,
        purposes: merged.purposes,
      });
      return merged;
    })
    .catch((err) => {
      const fallback = getGameFallback(key);
      if (fallback) return fallback;
      throw err;
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
  const base = STATIC_FILTERS || DEFAULT_FILTER_CATALOG;
  if (!apiFilters) {
    return {
      players: base.players?.length ? base.players : DEFAULT_FILTER_CATALOG.players,
      contexts: base.contexts || [],
      purposes: base.purposes || [],
      durations: base.durations?.length ? base.durations : DEFAULT_FILTER_CATALOG.durations,
    };
  }
  return {
    players: apiFilters.players?.length ? apiFilters.players : base.players || DEFAULT_FILTER_CATALOG.players,
    contexts: apiFilters.contexts?.length ? apiFilters.contexts : base.contexts || [],
    purposes: apiFilters.purposes?.length ? apiFilters.purposes : base.purposes || [],
    durations: apiFilters.durations?.length ? apiFilters.durations : base.durations || DEFAULT_FILTER_CATALOG.durations,
  };
}

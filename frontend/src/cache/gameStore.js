/**
 * In-memory session cache for catalog data (20 games) + detail/reviews.
 * Avoids re-hitting Render on every filter change or revisiting a detail page.
 */

import { fetchFilters, fetchGame, fetchGames, fetchReviews } from "../api.js";

const PAGE_SIZE = 10;
const CATALOG_SIZE = 50; // API max 50; catalog has 20 games

let catalogPromise = null;
let catalogGames = null; // GameSummary[]
let filtersPromise = null;
let filtersCache = null;

const summaryById = new Map();
const detailById = new Map();
const reviewsById = new Map();
const detailInflight = new Map();
const reviewsInflight = new Map();

function rememberSummary(game) {
  if (game?.id == null) return;
  summaryById.set(Number(game.id), game);
}

export function getCachedSummary(id) {
  return summaryById.get(Number(id)) || null;
}

export function getCachedDetail(id) {
  return detailById.get(Number(id)) || null;
}

export function getCachedReviews(id) {
  return reviewsById.has(Number(id)) ? reviewsById.get(Number(id)) : null;
}

export function getCachedFilters() {
  return filtersCache;
}

export function loadFilterCatalog() {
  if (filtersCache) return Promise.resolve(filtersCache);
  if (!filtersPromise) {
    filtersPromise = fetchFilters()
      .then((data) => {
        filtersCache = data;
        return data;
      })
      .catch((err) => {
        filtersPromise = null;
        throw err;
      });
  }
  return filtersPromise;
}

export function loadGameCatalog() {
  if (catalogGames) return Promise.resolve(catalogGames);
  if (!catalogPromise) {
    catalogPromise = fetchGames({ page: 0, size: CATALOG_SIZE })
      .then((data) => {
        catalogGames = Array.isArray(data?.content) ? data.content : [];
        catalogGames.forEach(rememberSummary);
        return catalogGames;
      })
      .catch((err) => {
        catalogPromise = null;
        throw err;
      });
  }
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
  const req = fetchGame(key)
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
  const req = fetchReviews(key)
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

/** After posting a review: refresh reviews + detail rating once. */
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
    rememberSummary(catalogGames.find((g) => Number(g.id) === key));
  }
  return { reviews, detail };
}

export function pageSize() {
  return PAGE_SIZE;
}

import catalog from "./catalog.json";

/** Offline-first catalogue: same 20 games as backend seed. */
export const STATIC_GAMES = catalog.games;

/** Filter options matching /api/filters (no network required on Home). */
export const STATIC_FILTERS = catalog.filters;

export function getStaticGameById(id) {
  const key = Number(id);
  return STATIC_GAMES.find((g) => Number(g.id) === key) || null;
}

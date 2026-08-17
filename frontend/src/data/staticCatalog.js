import catalog from "./catalog.json";

/** Shown when a game has no image, or the image file fails to load. */
export const FALLBACK_GAME_IMAGE = "/images/games/fallback.svg";

/** Offline-first catalogue: same 20 games as backend seed. */
export const STATIC_GAMES = catalog.games;

/** Filter options matching /api/filters (no network required on Home). */
export const STATIC_FILTERS = catalog.filters;

export function getStaticGameById(id) {
  const key = Number(id);
  return STATIC_GAMES.find((g) => Number(g.id) === key) || null;
}

/** Card/detail always get a usable image path from game data. */
export function getGameImage(game) {
  return game?.image || FALLBACK_GAME_IMAGE;
}

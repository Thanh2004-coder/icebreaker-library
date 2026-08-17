import catalog from "./catalog.json";

/** Shown when a game has no image, or the image file fails to load. */
export const FALLBACK_GAME_IMAGE = "/images/games/fallback.svg";
export const FALLBACK_INSTRUCTION_IMAGE = "/images/games/instructions/fallback.svg";

/** Offline-first catalogue: same 20 games as backend seed. */
export const STATIC_GAMES = catalog.games;

/** Filter options matching /api/filters (no network required on Home). */
export const STATIC_FILTERS = catalog.filters;

export function getStaticGameById(id) {
  const key = Number(id);
  return STATIC_GAMES.find((g) => Number(g.id) === key) || null;
}

/** List card image. */
export function getGameImage(game) {
  return game?.image || game?.heroImage || FALLBACK_GAME_IMAGE;
}

/** Detail hero image. */
export function getGameHeroImage(game) {
  return game?.heroImage || game?.image || FALLBACK_GAME_IMAGE;
}

/** How-to-play instruction image. */
export function getGameInstructionImage(game) {
  return game?.instructionImage || FALLBACK_INSTRUCTION_IMAGE;
}

export function onCatalogImageError(fallbackSrc) {
  return (event) => {
    const img = event.currentTarget;
    if (img.dataset.fallback === "1") return;
    img.dataset.fallback = "1";
    img.src = fallbackSrc;
  };
}

/** howToPlay may be a string (legacy/API) or string[] (catalogue). */
export function getHowToPlaySteps(game) {
  const raw = game?.howToPlay;
  if (Array.isArray(raw)) return raw.map((s) => String(s).trim()).filter(Boolean);
  if (raw == null || raw === "") return [];
  return String(raw)
    .split(/\n/)
    .map((line) => line.replace(/^\d+\.\s*/, "").trim())
    .filter(Boolean);
}

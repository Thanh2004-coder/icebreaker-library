/**
 * Client-side filter matching backend GameSpecifications / GameSummaryQuery semantics.
 */

function unaccent(input) {
  if (input == null) return "";
  return String(input)
    .trim()
    .normalize("NFD")
    .replace(/\p{M}+/gu, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

function slugToLabel(options, slug) {
  if (!slug || !options) return null;
  const hit = options.find((item) => item.value === slug);
  return hit?.label || null;
}

function matchesPlayers(game, players) {
  if (!players) return true;
  const count = game.minPlayers;
  switch (players) {
    case "2":
      return count === 2;
    case "3-4":
      return count >= 3 && count <= 4;
    case "5":
      return count === 5;
    case "6-10":
      return count >= 6 && count <= 10;
    case "10+":
    case "10plus":
    case "10":
      return count >= 10;
    default:
      return true;
  }
}

function matchesDuration(game, duration) {
  if (!duration) return true;
  const minutes = game.durationMin;
  switch (duration) {
    case "under-5":
    case "<5":
      return minutes < 5;
    case "5-7":
      return minutes >= 5 && minutes <= 7;
    case "8-10":
      return minutes >= 8 && minutes <= 10;
    case "10-15":
      return minutes >= 10 && minutes <= 15;
    case "over-15":
    case ">15":
      return minutes > 15;
    default:
      return true;
  }
}

function gameContextNames(game) {
  if (game.contexts?.length) return game.contexts;
  if (game.context) {
    return game.context.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function gamePurposeNames(game) {
  if (game.purposes?.length) return game.purposes;
  if (game.purpose) {
    return game.purpose.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

function matchesSearch(game, search) {
  if (!search || !search.trim()) return true;
  const raw = search.trim().toLowerCase();
  const needle = unaccent(search);
  const name = String(game.name || "").toLowerCase();
  const nameSearch = unaccent(game.name || "");
  return name.includes(raw) || nameSearch.includes(needle);
}

function matchesContext(game, contextSlug, filterCatalog) {
  if (!contextSlug) return true;
  const label = slugToLabel(filterCatalog?.contexts, contextSlug);
  if (!label) return true;
  return gameContextNames(game).includes(label);
}

/** Backend: game matches if it has ANY selected purpose slug (OR). */
function matchesPurposes(game, purposeSlugs, filterCatalog) {
  if (!purposeSlugs?.length) return true;
  const names = gamePurposeNames(game);
  return purposeSlugs.some((slug) => {
    const label = slugToLabel(filterCatalog?.purposes, slug);
    return label ? names.includes(label) : false;
  });
}

export function filterGames(games, { search, selected, filterCatalog }) {
  const list = Array.isArray(games) ? games : [];
  return list
    .filter((game) => matchesSearch(game, search))
    .filter((game) => matchesPlayers(game, selected?.players))
    .filter((game) => matchesContext(game, selected?.context, filterCatalog))
    .filter((game) => matchesPurposes(game, selected?.purposes, filterCatalog))
    .filter((game) => matchesDuration(game, selected?.duration))
    .slice()
    .sort((a, b) => String(a.name || "").localeCompare(String(b.name || ""), "vi"));
}

export function paginateGames(games, page, size) {
  const safeSize = size > 0 ? size : 10;
  const safePage = Math.max(page, 0);
  const totalElements = games.length;
  const totalPages = totalElements === 0 ? 0 : Math.ceil(totalElements / safeSize);
  const start = safePage * safeSize;
  return {
    content: games.slice(start, start + safeSize),
    page: safePage,
    size: safeSize,
    totalElements,
    totalPages,
  };
}

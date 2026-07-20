// YouTube helpers for the move library. No API key / backend, so we can't
// auto-search; instead a move gets a video by pasting a link (persisted in
// localStorage) and a search deep-link helps find one.

// Pull the 11-char id out of any common YouTube url shape, or a bare id.
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /\/embed\/([A-Za-z0-9_-]{11})/,
    /\/shorts\/([A-Za-z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = s.match(p);
    if (m) return m[1];
  }
  return null;
}

export const youtubeSearch = (move: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${move} brazilian jiu jitsu technique`,
  )}`;

const KEY = 'gps-move-videos';

export function getVideos(): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveVideo(move: string, id: string | null): void {
  const m = getVideos();
  if (id) m[move] = id;
  else delete m[move];
  localStorage.setItem(KEY, JSON.stringify(m));
}

// Pure merge for imported plan videos: fill only gaps (never clobber a video
// the user already set), validating each id. Exported for the check script.
export function mergedVideos(
  current: Record<string, string>,
  incoming: Record<string, unknown>,
): { next: Record<string, string>; added: number } {
  const next = { ...current };
  let added = 0;
  for (const [move, raw] of Object.entries(incoming ?? {})) {
    if (typeof raw !== 'string' || next[move]) continue;
    const id = parseYouTubeId(raw);
    if (id) {
      next[move] = id;
      added++;
    }
  }
  return { next, added };
}

// Merge an imported plan's { move: videoId } map into local storage.
export function mergeVideos(incoming: Record<string, unknown>): number {
  const { next, added } = mergedVideos(getVideos(), incoming);
  if (added) localStorage.setItem(KEY, JSON.stringify(next));
  return added;
}

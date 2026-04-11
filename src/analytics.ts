declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: (IArguments | unknown[])[];
  }
}

const GA_ID = process.env.EXPO_PUBLIC_GA_ID;

if (GA_ID && typeof document !== 'undefined') {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
}

function gtag(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag(...args);
  }
}

export function trackPageView() {
  gtag('event', 'page_view');
}

export function trackGameStart(mode: string, n: number, m: number, peekMode: boolean, raceTimeSecs?: number) {
  gtag('event', 'game_start', {
    game_mode: mode,
    matrix_size: n,
    modulus: m,
    peek_mode: peekMode,
    race_time_secs: raceTimeSecs ?? null,
  });
}

export function trackPuzzleSolved(
  mode: string,
  n: number,
  m: number,
  moveCount: number,
  elapsedSecs: number,
  peekMode: boolean,
  peekCount: number,
) {
  gtag('event', 'puzzle_solved', {
    game_mode: mode,
    matrix_size: n,
    modulus: m,
    move_count: moveCount,
    elapsed_secs: elapsedSecs,
    peek_mode: peekMode,
    peek_count: peekCount,
  });
}

export function trackGameEnd(
  mode: string,
  n: number,
  m: number,
  solvedCount: number,
  totalSecs: number,
  peekMode: boolean,
  totalMoves: number,
) {
  gtag('event', 'game_end', {
    game_mode: mode,
    matrix_size: n,
    modulus: m,
    solved_count: solvedCount,
    total_secs: totalSecs,
    peek_mode: peekMode,
    total_moves: totalMoves,
    avg_moves_per_puzzle: solvedCount > 0 ? Math.round(totalMoves / solvedCount) : null,
  });
}

/** Fired when a player quits an in-progress oneoff game without solving it. */
export function trackPuzzleAbandoned(
  mode: string,
  n: number,
  m: number,
  moveCount: number,
  elapsedSecs: number,
  peekMode: boolean,
) {
  gtag('event', 'puzzle_abandoned', {
    game_mode: mode,
    matrix_size: n,
    modulus: m,
    move_count: moveCount,
    elapsed_secs: elapsedSecs,
    peek_mode: peekMode,
  });
}

/** Fired when a player resets the puzzle back to its initial state. */
export function trackPuzzleReset(n: number, m: number, moveCount: number, peekMode: boolean) {
  gtag('event', 'puzzle_reset', {
    matrix_size: n,
    modulus: m,
    move_count: moveCount,
    peek_mode: peekMode,
  });
}

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

export function trackGameStart(mode: string, n: number, m: number) {
  gtag('event', 'game_start', {
    game_mode: mode,
    matrix_size: n,
    modulus: m,
  });
}

export function trackPuzzleSolved(mode: string, moveCount: number, elapsedSecs: number) {
  gtag('event', 'puzzle_solved', {
    game_mode: mode,
    move_count: moveCount,
    elapsed_secs: elapsedSecs,
  });
}

export function trackGameEnd(mode: string, solvedCount: number, totalSecs: number) {
  gtag('event', 'game_end', {
    game_mode: mode,
    solved_count: solvedCount,
    total_secs: totalSecs,
  });
}

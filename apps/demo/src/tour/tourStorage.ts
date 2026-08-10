const CORE_SEEN_KEY = "fdt-demo-tour-core-seen";
const PAGES_SEEN_KEY = "fdt-demo-tour-pages-seen";

function readSeen(key: string): boolean {
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeSeen(key: string): void {
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Private browsing / storage quota exceeded — the tour just replays next visit instead.
  }
}

export const hasSeenCoreTour = (): boolean => readSeen(CORE_SEEN_KEY);
export const markCoreTourSeen = (): void => writeSeen(CORE_SEEN_KEY);
export const hasSeenPagesTour = (): boolean => readSeen(PAGES_SEEN_KEY);
export const markPagesTourSeen = (): void => writeSeen(PAGES_SEEN_KEY);

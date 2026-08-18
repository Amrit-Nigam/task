import { useSyncExternalStore } from "react";

/**
 * Ball themes — ported from the Perps cockpit (handoff ADDENDUM-6 §3).
 *
 * Four balls, each carrying a *pair*: `casing` is the shell the device is
 * moulded from, `accent` is the secondary that every interactive part takes.
 * The pairing is the whole point — Great is blue with red, Ultra is black with
 * gold — so a theme is never a single-hue tint.
 *
 * The retint is done in CSS, not by re-rendering: the active ball writes
 * `--ball-*` onto <html>, and index.css's `--pd-*` tokens read through them.
 * Anything already painted with a token follows for free, and the `.35s`
 * transition on the shell does the fade.
 *
 * `accentInk` is the text colour on accent-filled buttons. It is black for
 * Ultra's gold and white elsewhere — fill with the accent without it and
 * Ultra's buttons become unreadable.
 *
 * `panel`/`slot`/`slot2`/`screen` are the *interior*: the moulded faces, the
 * recessed fields and the lit display the grid sits on. They are hand-tuned
 * tints rather than a computed mix of the casing — Ultra's casing is almost
 * black, so mixing it in would only grey the interior down instead of reading
 * as Ultra. Each ball's interior is tinted toward the colour that *identifies*
 * it (Ultra's gold, Master's violet), kept within a few percent of white so
 * `--pd-ink` contrast is untouched.
 */
export interface Ball {
  key: string;
  name: string;
  casing: string;
  ridgeA: string;
  ridgeB: string;
  dome: string;
  domeLo: string;
  accent: string;
  accentInk: string;
  panel: string;
  slot: string;
  slot2: string;
  screen: string;
}

export const BALLS: Ball[] = [
  {
    key: "poke",
    name: "Poké Ball",
    casing: "#B4293C",
    ridgeA: "#C9455A",
    ridgeB: "#7A1526",
    dome: "#E0343F",
    domeLo: "#8E1622",
    accent: "#B4293C",
    accentInk: "#ffffff",
    panel: "#F7F1F2",
    slot: "#EDE0E2",
    slot2: "#E0D0D3",
    screen: "#FFFBFB",
  },
  {
    key: "great",
    name: "Great Ball",
    casing: "#22548F",
    ridgeA: "#3B74B8",
    ridgeB: "#123963",
    dome: "#2A6FD0",
    domeLo: "#123963",
    accent: "#C4444F",
    accentInk: "#ffffff",
    panel: "#F1F4FA",
    slot: "#E0E7F2",
    slot2: "#D0DBEA",
    screen: "#FAFCFF",
  },
  {
    key: "ultra",
    name: "Ultra Ball",
    casing: "#2A2B2F",
    ridgeA: "#45474D",
    ridgeB: "#141518",
    dome: "#F2C438",
    domeLo: "#B98C0E",
    accent: "#E5B32A",
    accentInk: "#1b1b1b",
    panel: "#F7F4EA",
    slot: "#EDE5D2",
    slot2: "#DFD5BC",
    screen: "#FFFDF4",
  },
  {
    key: "master",
    name: "Master Ball",
    casing: "#54338A",
    ridgeA: "#7350AC",
    ridgeB: "#341D57",
    dome: "#7B4BB5",
    domeLo: "#3E2270",
    accent: "#C4519B",
    accentInk: "#ffffff",
    panel: "#F5F1FA",
    slot: "#E7DFF3",
    slot2: "#D9CDEB",
    screen: "#FDFAFF",
  },
];

const STORAGE_KEY = "pokedex.ball";

/** Read the persisted choice. Never throws — private mode blocks storage. */
function readStored(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const i = Number(raw);
    return Number.isInteger(i) && i >= 0 && i < BALLS.length ? i : 0;
  } catch {
    return 0;
  }
}

let index = typeof window === "undefined" ? 0 : readStored();
const listeners = new Set<() => void>();

/**
 * `"#B4293C"` → `"180 41 60"` — the space-separated triplet Tailwind's
 * `rgb(var(--token) / <alpha-value>)` colours require. The hex form is kept
 * alongside it for the chrome, which never needs an alpha channel.
 */
function toTriplet(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}

/**
 * Push the active ball onto <html> as `--ball-*`. Written at the document root
 * rather than on the shell because the device layer re-declares `--pd-*`
 * locally — a var set on <body> would be shadowed by that block, whereas one
 * the tokens *reference* resolves through inheritance from wherever it is set.
 *
 * Each colour is written twice: `--ball-x` as hex for the device chrome, and
 * `--ball-x-rgb` as a triplet so the Tailwind token layer can take an alpha.
 */
function paint() {
  if (typeof document === "undefined") return;
  const b = BALLS[index];
  const root = document.documentElement.style;
  const set = (name: string, hex: string) => {
    root.setProperty(`--ball-${name}`, hex);
    root.setProperty(`--ball-${name}-rgb`, toTriplet(hex));
  };
  set("casing", b.casing);
  set("ridge-a", b.ridgeA);
  set("ridge-b", b.ridgeB);
  set("dome", b.dome);
  set("dome-lo", b.domeLo);
  set("accent", b.accent);
  set("accent-ink", b.accentInk);
  set("panel", b.panel);
  set("slot", b.slot);
  set("slot-2", b.slot2);
  set("screen", b.screen);
}

if (typeof document !== "undefined") paint();

/** Index of the active ball. */
export const getBallIndex = () => index;

/** The active ball descriptor. */
export const getBall = () => BALLS[index];

/** Select a ball by index, repaint, persist, and notify subscribers. */
export function setBallIndex(next: number) {
  const i = ((next % BALLS.length) + BALLS.length) % BALLS.length;
  if (i === index) return;
  index = i;
  paint();
  try {
    window.localStorage.setItem(STORAGE_KEY, String(i));
  } catch {
    /* storage unavailable — the theme still applies for this session */
  }
  listeners.forEach((fn) => fn());
}

/** Poké → Great → Ultra → Master → Poké. */
export const cycleBall = () => setBallIndex(index + 1);

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Subscribe a component to the active ball, re-rendering on change. */
export function useBall(): Ball {
  return useSyncExternalStore(subscribe, getBall, getBall);
}

/** Subscribe to the active ball's index (for switcher selected-state). */
export function useBallIndex(): number {
  return useSyncExternalStore(subscribe, getBallIndex, getBallIndex);
}

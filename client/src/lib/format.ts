/** Formatting helpers shared by the card, the drawer and the compare panel. */

export function formatDexNumber(id: number): string {
  return `#${String(id).padStart(4, "0")}`;
}

/** PokéAPI reports height in decimetres. */
export function formatHeight(decimetres: number): string {
  return `${(decimetres / 10).toFixed(1)} m`;
}

/** PokéAPI reports weight in hectograms. */
export function formatWeight(hectograms: number): string {
  return `${(hectograms / 10).toFixed(1)} kg`;
}

/** "lightning-rod" -> "Lightning rod" */
export function humanise(slug: string): string {
  const spaced = slug.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Title-cased for display: "mr-mime" -> "Mr Mime" */
export function formatName(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

import L from "leaflet";

/**
 * The map pin. Drawn as inline SVG rather than an image on purpose:
 *
 * · The guild mark in `assets/penguin-icon.png` is 202 KB — a lot of bytes to
 *   ship for something rendered at 40 px, and this build inlines its assets.
 * · SVG stays crisp on retina, scales with no extra file, and its parts can be
 *   themed from the palette instead of being baked into pixels.
 *
 * Colors are literals rather than CSS variables because Leaflet injects this
 * markup as a plain string; the values mirror theme/Theme.tsx (gold 6/8,
 * arcane 5, dark 7).
 */
const penguinSvg = (): string => `
<svg width="40" height="54" viewBox="0 0 40 54" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
  <!-- Teardrop body of the pin, in loot gold -->
  <path
    d="M20 52.5 C20 52.5 38.5 32 38.5 20 A18.5 18.5 0 1 0 1.5 20 C1.5 32 20 52.5 20 52.5 Z"
    fill="#ffb300" stroke="#c48200" stroke-width="1.4" stroke-linejoin="round" />
  <!-- Cream medallion: gives the penguin a light field so it reads at 40px -->
  <circle cx="20" cy="20" r="13" fill="#f7f3ea" />

  <!-- Party hat, because this pin marks a party and not a raid -->
  <path d="M16.9 13.6 L21.4 7.9 L23.6 14.6 Z" fill="#7130ff" stroke="#4c14d2" stroke-width="0.7" stroke-linejoin="round" />
  <circle cx="21.4" cy="7.4" r="1.6" fill="#ffb300" stroke="#c48200" stroke-width="0.6" />

  <!-- Penguin -->
  <ellipse cx="20" cy="21.6" rx="8.4" ry="9.5" fill="#23211d" />
  <ellipse cx="17.2" cy="30.6" rx="2.3" ry="1.2" fill="#ff9a1f" />
  <ellipse cx="22.8" cy="30.6" rx="2.3" ry="1.2" fill="#ff9a1f" />
  <ellipse cx="20" cy="22.2" rx="5.2" ry="7.4" fill="#f7f3ea" />
  <circle cx="18.1" cy="17.6" r="1.05" fill="#23211d" />
  <circle cx="21.9" cy="17.6" r="1.05" fill="#23211d" />
  <path d="M18.5 19.9 L21.5 19.9 L20 22.1 Z" fill="#ff9a1f" />
</svg>`;

interface PenguinPinOptions {
  /** State classes for the marker element itself (active, upcoming…). */
  className: string;
  /**
   * Class for the inner wrapper, which is what actually animates.
   *
   * This split is not cosmetic: Leaflet positions every marker by writing
   * `transform: translate3d(...)` onto the marker element. Animating transform
   * on that same element overwrites the position and drops every pin onto the
   * map's origin. So the outer element stays Leaflet's, and all movement —
   * drop-in, hover lift, press — happens on this inner one.
   */
  innerClassName: string;
  /** Accessible name announced when the marker takes focus. */
  label: string;
}

export const penguinPin = ({
  className,
  innerClassName,
  label,
}: PenguinPinOptions): L.DivIcon =>
  L.divIcon({
    className,
    // Leaflet renders this string as-is, so the label has to travel inside it.
    html: `<span class="${innerClassName}" role="img" aria-label="${label.replace(
      /"/g,
      "&quot;"
    )}">${penguinSvg()}</span>`,
    iconSize: [40, 54],
    // Anchor at the tip, so the pin points at the actual coordinates.
    iconAnchor: [20, 53],
    tooltipAnchor: [0, -46],
  });

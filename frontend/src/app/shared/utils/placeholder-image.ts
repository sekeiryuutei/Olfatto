/**
 * Generates a self-contained SVG data: URI as a fragrance-card placeholder —
 * zero network dependency, so it can never 404 or hang waiting on a
 * third-party service (unlike the placehold.co URLs the seed used to ship,
 * point 2/estético). Used both as the default when a fragrance has no
 * imageUrl, and as the onerror fallback when a real URL fails to load.
 */
export function placeholderImageDataUri(label: string): string {
  const initial = (label.trim()[0] ?? '?').toUpperCase();
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1B1B1F"/>
          <stop offset="100%" stop-color="#141416"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <text x="200" y="228" font-family="Georgia, serif" font-size="140"
            fill="#D4AF37" text-anchor="middle">${initial}</text>
    </svg>
  `.trim();
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

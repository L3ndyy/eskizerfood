// SVG data URI — работает без внешних CDN, без геоблокировки
const placeholder = (emoji: string, bg: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="${bg}" width="200" height="200"/><text fill="rgba(255,255,255,0.6)" x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="central">${emoji}</text></svg>`
  )}`;

const CATEGORY_IMAGES: Record<string, string> = {
  pizza: placeholder('🍕', '#5c3d2e'),
  sushi: placeholder('🍣', '#2d3d4d'),
  burgers: placeholder('🍔', '#4a3525'),
  pasta: placeholder('🍝', '#4a3a2e'),
  salads: placeholder('🥗', '#2d4a35'),
  desserts: placeholder('🍰', '#4a2d3a'),
  drinks: placeholder('🥤', '#2d3d4a'),
  snacks: placeholder('🍟', '#3d3a25'),
};
const DEFAULT = placeholder('🍽', '#333');

export function getDishImageUrl(
  image: string | null | undefined,
  categorySlug?: string | null
): string {
  if (image?.startsWith('data:')) return image;
  return CATEGORY_IMAGES[categorySlug ?? ''] ?? DEFAULT;
}

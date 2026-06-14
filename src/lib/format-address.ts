type OsmAddress = Record<string, string>;

/** Короткий адрес: улица и дом, без района, индекса и т.д. */
export function formatShortAddress(
  parts: OsmAddress | undefined,
  displayName?: string
): string {
  if (parts) {
    const street =
      parts.road ||
      parts.pedestrian ||
      parts.footway ||
      parts.street ||
      parts.residential ||
      parts.path;

    const house = parts.house_number || parts.building;

    if (street && house) {
      return `${street}, д. ${house}`;
    }
    if (street) {
      return street;
    }
  }

  if (displayName) {
    return displayName
      .split(',')
      .slice(0, 2)
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ');
  }

  return '';
}

export function parseArrayField(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.map((item) => String(item));
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

export function normalizeProduct<T extends { colors: string; sizes: string; tags: string }>(product: T) {
  return {
    ...product,
    colors: parseArrayField(product.colors),
    sizes: parseArrayField(product.sizes),
    tags: parseArrayField(product.tags)
  };
}

export function parseAddOns(value: string): string[] {
  return parseArrayField(value);
}
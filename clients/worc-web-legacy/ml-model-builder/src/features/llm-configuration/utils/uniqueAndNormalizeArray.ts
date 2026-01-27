/**
 * One-pass solution using Map:
 * - Ensures unique items by `value`
 * - Normalizes so `label === value`
 * - Last occurrence wins
 */
export function uniqueAndNormalizeArray<
  T extends { value: string; label: string },
>(arr: readonly T[]): T[] {
  const map = new Map<string, T>();

  for (const item of arr) {
    map.set(item.value, {
      ...item,
      label: item.value,
    });
  }

  return Array.from(map.values());
}

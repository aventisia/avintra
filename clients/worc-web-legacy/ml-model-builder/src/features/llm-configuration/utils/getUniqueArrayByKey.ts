/**
 * Returns a new array with unique objects based on a specific key.
 * If multiple objects have the same key value, the last one will be kept.
 *
 * @template T - Type of objects in the array
 * @template K - Key of the object to check uniqueness
 * @param {T[]} arr - Array of objects to filter
 * @param {K} key - Object key to determine uniqueness
 * @returns {T[]} - Array of unique objects
 */
export function getUniqueArrayByKey<T, K extends keyof T>(
  arr: T[],
  key: K,
): T[] {
  // Create a Map to hold unique items by the given key
  const map = new Map<T[K], T>();

  // Iterate over the array and set each item in the map
  // If the key already exists, it will be overwritten (last one wins)
  arr.forEach((item) => {
    map.set(item[key], item);
  });

  // Convert the map values back into an array
  return Array.from(map.values());
}

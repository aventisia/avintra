/**
 * Asynchronous function to simulate a delay.
 *
 * @param {number} [ms=2000] - The number of milliseconds to delay.
 * @returns {Promise<void>} - A promise that resolves after the specified delay.
 */
export function sleep(ms = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import { BaseDirectory, readTextFile } from "@tauri-apps/plugin-fs";

/**
 * Loads a JSON file from Tauri's bundled resources directory
 * @param relativePath - Path relative to the resources directory (e.g., "action-selector/_ActionSelectorData.json")
 * @returns Parsed JSON content
 */
export async function loadJsonFromTauriResources<T = unknown>(relativePath: string): Promise<T> {
  try {
    const content = await readTextFile(`config-files/${relativePath}`, {
      baseDir: BaseDirectory.Resource,
    });
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Failed to load ${relativePath} from Tauri resources:`, error);
    throw error;
  }
}

/**
 * Loads multiple JSON files from Tauri's bundled resources
 * @param relativePaths - Array of paths relative to the resources directory
 * @returns Array of parsed JSON contents
 */
export async function loadMultipleJsonFromTauriResources<T = unknown>(
  relativePaths: string[],
): Promise<T[]> {
  const promises = relativePaths.map((path) => loadJsonFromTauriResources<T>(path));
  return Promise.all(promises);
}

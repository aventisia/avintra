import { readFile, exists } from "@tauri-apps/plugin-fs";

/**
 * Read a file as base64
 */
export const readFileAsBase64 = async (
  filePath: string,
): Promise<string | null> => {
  try {
    // Check if file exists
    const fileExists = await exists(filePath);
    if (!fileExists) {
      console.error(`File not found: ${filePath}`);
      return null;
    }

    // Read file as Uint8Array
    const bytes = await readFile(filePath);

    // Convert bytes to base64
    const base64 = btoa(
      bytes.reduce((str, byte) => str + String.fromCharCode(byte), ""),
    );

    return base64;
  } catch (error) {
    console.error(`Error reading file: ${filePath}`, error);
    return null;
  }
};
